from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


meeting_participants = Table(
    "meeting_participants",
    Base.metadata,
    Column("meeting_id", ForeignKey("meetings.id"), primary_key=True),
    Column("participant_id", ForeignKey("participants.id"), primary_key=True),
)


class Meeting(Base):
    __tablename__ = "meetings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    meeting_date: Mapped[datetime] = mapped_column(DateTime)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    participants: Mapped[list["Participant"]] = relationship(
        secondary=meeting_participants,
        back_populates="meetings",
    )

    transcript_segments: Mapped[list["TranscriptSegment"]] = relationship(
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="TranscriptSegment.sequence_number",
    )

    summary: Mapped["Summary | None"] = relationship(
        back_populates="meeting",
        cascade="all, delete-orphan",
        uselist=False,
    )

    action_items: Mapped[list["ActionItem"]] = relationship(
        back_populates="meeting",
        cascade="all, delete-orphan",
    )

    chapters: Mapped[list["Chapter"]] = relationship(
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="Chapter.sequence_number",
    )


class Participant(Base):
    __tablename__ = "participants"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar_color: Mapped[str | None] = mapped_column(String(30), nullable=True)

    meetings: Mapped[list["Meeting"]] = relationship(
        secondary=meeting_participants,
        back_populates="participants",
    )

    transcript_segments: Mapped[list["TranscriptSegment"]] = relationship(
        back_populates="speaker",
    )

    assigned_action_items: Mapped[list["ActionItem"]] = relationship(
        back_populates="assignee",
    )


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    meeting_id: Mapped[int] = mapped_column(
        ForeignKey("meetings.id"),
        index=True,
    )

    speaker_id: Mapped[int | None] = mapped_column(
        ForeignKey("participants.id"),
        nullable=True,
    )

    start_time: Mapped[float] = mapped_column(Float)
    end_time: Mapped[float] = mapped_column(Float)
    text: Mapped[str] = mapped_column(Text)
    sequence_number: Mapped[int] = mapped_column(Integer)

    meeting: Mapped["Meeting"] = relationship(
        back_populates="transcript_segments",
    )

    speaker: Mapped["Participant | None"] = relationship(
        back_populates="transcript_segments",
    )


class Summary(Base):
    __tablename__ = "summaries"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    meeting_id: Mapped[int] = mapped_column(
        ForeignKey("meetings.id"),
        unique=True,
        index=True,
    )

    overview: Mapped[str] = mapped_column(Text)

    meeting: Mapped["Meeting"] = relationship(
        back_populates="summary",
    )


class ActionItem(Base):
    __tablename__ = "action_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    meeting_id: Mapped[int] = mapped_column(
        ForeignKey("meetings.id"),
        index=True,
    )

    assignee_id: Mapped[int | None] = mapped_column(
        ForeignKey("participants.id"),
        nullable=True,
    )

    text: Mapped[str] = mapped_column(Text)

    is_completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    meeting: Mapped["Meeting"] = relationship(
        back_populates="action_items",
    )

    assignee: Mapped["Participant | None"] = relationship(
        back_populates="assigned_action_items",
    )


class Chapter(Base):
    __tablename__ = "chapters"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    meeting_id: Mapped[int] = mapped_column(
        ForeignKey("meetings.id"),
        index=True,
    )

    title: Mapped[str] = mapped_column(String(255))
    start_time: Mapped[float] = mapped_column(Float)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    sequence_number: Mapped[int] = mapped_column(Integer)

    meeting: Mapped["Meeting"] = relationship(
        back_populates="chapters",
    )