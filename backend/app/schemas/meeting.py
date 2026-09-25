from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ParticipantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str | None
    avatar_color: str | None


class TranscriptSegmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    start_time: float
    end_time: float
    text: str
    sequence_number: int
    speaker: ParticipantResponse | None


class SummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    overview: str


class ActionItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    text: str
    is_completed: bool
    assignee: ParticipantResponse | None


class ChapterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    start_time: float
    summary: str | None
    sequence_number: int


class MeetingListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    meeting_date: datetime
    duration_seconds: int
    participants: list[ParticipantResponse]


class MeetingDetailResponse(MeetingListResponse):
    transcript_segments: list[TranscriptSegmentResponse]
    summary: SummaryResponse | None
    action_items: list[ActionItemResponse]
    chapters: list[ChapterResponse]