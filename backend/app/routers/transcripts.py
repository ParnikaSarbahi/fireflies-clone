from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.models import TranscriptSegment
from app.schemas.meeting import (
    TranscriptSegmentResponse,
    TranscriptSegmentUpdate,
)


router = APIRouter(
    prefix="/api/transcript-segments",
    tags=["Transcripts"],
)


@router.patch(
    "/{segment_id}",
    response_model=TranscriptSegmentResponse,
)
def update_transcript_segment(
    segment_id: int,
    update: TranscriptSegmentUpdate,
    db: Session = Depends(get_db),
):
    segment = (
        db.query(TranscriptSegment)
        .options(
            selectinload(
                TranscriptSegment.speaker
            )
        )
        .filter(
            TranscriptSegment.id == segment_id
        )
        .first()
    )

    if segment is None:
        raise HTTPException(
            status_code=404,
            detail="Transcript segment not found",
        )

    cleaned_text = update.text.strip()

    if not cleaned_text:
        raise HTTPException(
            status_code=400,
            detail="Transcript text cannot be empty",
        )

    segment.text = cleaned_text

    db.commit()

    return (
        db.query(TranscriptSegment)
        .options(
            selectinload(
                TranscriptSegment.speaker
            )
        )
        .filter(
            TranscriptSegment.id == segment_id
        )
        .first()
    )