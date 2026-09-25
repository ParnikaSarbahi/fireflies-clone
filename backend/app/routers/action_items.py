from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.models import ActionItem, Meeting, Participant
from app.schemas.meeting import (
    ActionItemCreate,
    ActionItemResponse,
    ActionItemUpdate,
)


router = APIRouter(
    prefix="/api",
    tags=["Action Items"],
)


@router.post(
    "/meetings/{meeting_id}/action-items",
    response_model=ActionItemResponse,
    status_code=201,
)
def create_action_item(
    meeting_id: int,
    action_item: ActionItemCreate,
    db: Session = Depends(get_db),
):
    meeting = (
        db.query(Meeting)
        .filter(Meeting.id == meeting_id)
        .first()
    )

    if meeting is None:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    cleaned_text = action_item.text.strip()

    if not cleaned_text:
        raise HTTPException(
            status_code=400,
            detail="Action item text cannot be empty",
        )

    if action_item.assignee_id is not None:
        assignee = (
            db.query(Participant)
            .filter(
                Participant.id
                == action_item.assignee_id
            )
            .first()
        )

        if assignee is None:
            raise HTTPException(
                status_code=404,
                detail="Assignee not found",
            )

    new_action_item = ActionItem(
        meeting_id=meeting_id,
        assignee_id=action_item.assignee_id,
        text=cleaned_text,
        is_completed=False,
    )

    db.add(new_action_item)
    db.commit()

    action_item_id = new_action_item.id

    return (
        db.query(ActionItem)
        .options(
            selectinload(ActionItem.assignee)
        )
        .filter(
            ActionItem.id == action_item_id
        )
        .first()
    )


@router.patch(
    "/action-items/{action_item_id}",
    response_model=ActionItemResponse,
)
def update_action_item(
    action_item_id: int,
    update: ActionItemUpdate,
    db: Session = Depends(get_db),
):
    action_item = (
        db.query(ActionItem)
        .options(
            selectinload(ActionItem.assignee)
        )
        .filter(
            ActionItem.id == action_item_id
        )
        .first()
    )

    if action_item is None:
        raise HTTPException(
            status_code=404,
            detail="Action item not found",
        )

    if update.text is not None:
        cleaned_text = update.text.strip()

        if not cleaned_text:
            raise HTTPException(
                status_code=400,
                detail="Action item text cannot be empty",
            )

        action_item.text = cleaned_text

    if update.is_completed is not None:
        action_item.is_completed = (
            update.is_completed
        )

    if update.assignee_id is not None:
        assignee = (
            db.query(Participant)
            .filter(
                Participant.id
                == update.assignee_id
            )
            .first()
        )

        if assignee is None:
            raise HTTPException(
                status_code=404,
                detail="Assignee not found",
            )

        action_item.assignee_id = (
            update.assignee_id
        )

    db.commit()

    return (
        db.query(ActionItem)
        .options(
            selectinload(ActionItem.assignee)
        )
        .filter(
            ActionItem.id == action_item_id
        )
        .first()
    )


@router.delete(
    "/action-items/{action_item_id}",
    status_code=204,
)
def delete_action_item(
    action_item_id: int,
    db: Session = Depends(get_db),
):
    action_item = (
        db.query(ActionItem)
        .filter(
            ActionItem.id == action_item_id
        )
        .first()
    )

    if action_item is None:
        raise HTTPException(
            status_code=404,
            detail="Action item not found",
        )

    db.delete(action_item)
    db.commit()