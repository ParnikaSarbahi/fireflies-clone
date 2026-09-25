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
    MeetingDetailResponse,
    MeetingListResponse,
)
router = APIRouter(
    prefix="/api/meetings",
    tags=["Meetings"],
)


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