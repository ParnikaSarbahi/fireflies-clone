from datetime import date, datetime, time

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

from app.database import get_db

from app.models.models import (
    ActionItem,
    Meeting,
    Participant,
    TranscriptSegment,
)

from app.schemas.meeting import (
    MeetingCreate,
    MeetingDetailResponse,
    MeetingListResponse,
    MeetingUpdate,
)

router = APIRouter(
    prefix="/api/meetings",
    tags=["Meetings"],
)

def get_or_create_participant(
    db: Session,
    name: str,
) -> Participant:
    cleaned_name = name.strip()

    participant = (
        db.query(Participant)
        .filter(
            Participant.name.ilike(cleaned_name)
        )
        .first()
    )

    if participant:
        return participant

    participant = Participant(
        name=cleaned_name,
        email=None,
        avatar_color="#6D32E9",
    )

    db.add(participant)
    db.flush()

    return participant

@router.get("", response_model=list[MeetingListResponse])
def get_meetings(
    search: str | None = Query(default=None),
    participant: str | None = Query(default=None),
    meeting_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Meeting)
        .options(selectinload(Meeting.participants))
    )

    if search:
        search_term = f"%{search.strip()}%"

        query = (
            query
            .outerjoin(Meeting.participants)
            .filter(
                or_(
                    Meeting.title.ilike(search_term),
                    Participant.name.ilike(search_term),
                )
            )
            .distinct()
        )

    if participant:
        participant_term = f"%{participant.strip()}%"

        query = (
            query
            .join(Meeting.participants)
            .filter(Participant.name.ilike(participant_term))
            .distinct()
        )

    if meeting_date:
        start = datetime.combine(meeting_date, time.min)
        end = datetime.combine(meeting_date, time.max)

        query = query.filter(
            Meeting.meeting_date >= start,
            Meeting.meeting_date <= end,
        )

    return query.order_by(Meeting.meeting_date.desc()).all()

@router.post(
    "",
    response_model=MeetingDetailResponse,
    status_code=201,
)
def create_meeting(
    meeting_data: MeetingCreate,
    db: Session = Depends(get_db),
):
    title = meeting_data.title.strip()

    if not title:
        raise HTTPException(
            status_code=400,
            detail="Meeting title cannot be empty",
        )

    if meeting_data.duration_seconds < 0:
        raise HTTPException(
            status_code=400,
            detail="Duration cannot be negative",
        )

    meeting = Meeting(
        title=title,
        meeting_date=meeting_data.meeting_date,
        duration_seconds=meeting_data.duration_seconds,
    )

    # Add participants.
    participants = []

    for name in meeting_data.participant_names:
        if not name.strip():
            continue

        participant = get_or_create_participant(
            db,
            name,
        )

        if participant not in participants:
            participants.append(participant)

    meeting.participants = participants

    db.add(meeting)
    db.flush()

    # ---------------------------------
    # Simple pasted-transcript parser
    # ---------------------------------

    if meeting_data.transcript_text:
        lines = [
            line.strip()
            for line in meeting_data.transcript_text.splitlines()
            if line.strip()
        ]

        current_time = 0.0
        segment_duration = 15.0

        for index, line in enumerate(lines):
            if ":" in line:
                speaker_name, text = line.split(
                    ":",
                    1,
                )

                speaker_name = (
                    speaker_name.strip()
                )

                text = text.strip()

                if not text:
                    continue

                speaker = (
                    get_or_create_participant(
                        db,
                        speaker_name,
                    )
                )

                if (
                    speaker
                    not in meeting.participants
                ):
                    meeting.participants.append(
                        speaker
                    )

            else:
                speaker = None
                text = line

            segment = TranscriptSegment(
                meeting_id=meeting.id,
                speaker_id=(
                    speaker.id
                    if speaker
                    else None
                ),
                start_time=current_time,
                end_time=(
                    current_time
                    + segment_duration
                ),
                text=text,
                sequence_number=index + 1,
            )

            db.add(segment)

            current_time += (
                segment_duration
            )

        # If the user did not provide a
        # duration, derive it from transcript.
        if (
            meeting.duration_seconds == 0
            and current_time > 0
        ):
            meeting.duration_seconds = int(
                current_time
            )

    db.commit()

    # Re-query with all relationships
    # needed by MeetingDetailResponse.
    created_meeting = (
        db.query(Meeting)
        .options(
            selectinload(
                Meeting.participants
            ),
            selectinload(
                Meeting.summary
            ),
            selectinload(
                Meeting.chapters
            ),
            selectinload(
                Meeting.transcript_segments
            ).selectinload(
                TranscriptSegment.speaker
            ),
            selectinload(
                Meeting.action_items
            ).selectinload(
                ActionItem.assignee
            ),
        )
        .filter(
            Meeting.id == meeting.id
        )
        .first()
    )

    return created_meeting




@router.get("/{meeting_id}", response_model=MeetingDetailResponse)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = (
        db.query(Meeting)
        .options(
            selectinload(Meeting.participants),
            selectinload(Meeting.summary),
            selectinload(Meeting.chapters),
            selectinload(Meeting.transcript_segments).selectinload(
                TranscriptSegment.speaker
            ),
            selectinload(Meeting.action_items).selectinload(
                ActionItem.assignee
            ),
        )
        .filter(Meeting.id == meeting_id)
        .first()
    )

    if meeting is None:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    return meeting


@router.patch(
    "/{meeting_id}",
    response_model=MeetingDetailResponse,
)
def update_meeting(
    meeting_id: int,
    meeting_data: MeetingUpdate,
    db: Session = Depends(get_db),
):
    meeting = (
        db.query(Meeting)
        .options(
            selectinload(
                Meeting.participants
            ),
            selectinload(
                Meeting.summary
            ),
            selectinload(
                Meeting.chapters
            ),
            selectinload(
                Meeting.transcript_segments
            ).selectinload(
                TranscriptSegment.speaker
            ),
            selectinload(
                Meeting.action_items
            ).selectinload(
                ActionItem.assignee
            ),
        )
        .filter(
            Meeting.id == meeting_id
        )
        .first()
    )

    if meeting is None:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    if meeting_data.title is not None:
        title = (
            meeting_data.title.strip()
        )

        if not title:
            raise HTTPException(
                status_code=400,
                detail="Meeting title cannot be empty",
            )

        meeting.title = title

    if (
        meeting_data.meeting_date
        is not None
    ):
        meeting.meeting_date = (
            meeting_data.meeting_date
        )

    if (
        meeting_data.duration_seconds
        is not None
    ):
        if (
            meeting_data.duration_seconds
            < 0
        ):
            raise HTTPException(
                status_code=400,
                detail="Duration cannot be negative",
            )

        meeting.duration_seconds = (
            meeting_data.duration_seconds
        )

    if (
        meeting_data.participant_names
        is not None
    ):
        participants = []

        for name in (
            meeting_data.participant_names
        ):
            if not name.strip():
                continue

            participant = (
                get_or_create_participant(
                    db,
                    name,
                )
            )

            if (
                participant
                not in participants
            ):
                participants.append(
                    participant
                )

        meeting.participants = (
            participants
        )

    db.commit()

    return (
        db.query(Meeting)
        .options(
            selectinload(
                Meeting.participants
            ),
            selectinload(
                Meeting.summary
            ),
            selectinload(
                Meeting.chapters
            ),
            selectinload(
                Meeting.transcript_segments
            ).selectinload(
                TranscriptSegment.speaker
            ),
            selectinload(
                Meeting.action_items
            ).selectinload(
                ActionItem.assignee
            ),
        )
        .filter(
            Meeting.id == meeting_id
        )
        .first()
    )

@router.delete(
    "/{meeting_id}",
    status_code=204,
)
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
):
    meeting = (
        db.query(Meeting)
        .filter(
            Meeting.id == meeting_id
        )
        .first()
    )

    if meeting is None:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    db.delete(meeting)
    db.commit()