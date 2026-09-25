from datetime import datetime

from app.database import Base, SessionLocal, engine
from app.models.models import (
    ActionItem,
    Chapter,
    Meeting,
    Participant,
    Summary,
    TranscriptSegment,
)


def reset_and_seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:

        # -------------------------
        # Participants
        # -------------------------

        parnika = Participant(
            name="Parnika Sarbahi",
            email="parnika@example.com",
            avatar_color="#7C3AED",
        )

        rahul = Participant(
            name="Rahul Mehta",
            email="rahul@example.com",
            avatar_color="#2563EB",
        )

        ananya = Participant(
            name="Ananya Sharma",
            email="ananya@example.com",
            avatar_color="#059669",
        )

        aditya = Participant(
        name="Aditya Verma",
        email="aditya@example.com",
        avatar_color="#DC2626",
        )

        meera = Participant(
            name="Meera Kapoor",
            email="meera@example.com",
            avatar_color="#D97706",
        )

        arjun = Participant(
            name="Arjun Nair",
            email="arjun@example.com",
            avatar_color="#0891B2",
        )

        db.add_all([
            parnika,
            rahul,
            ananya,
            aditya,
            meera,
            arjun,
        ])
        db.flush()

        # -------------------------
        # Meeting
        # -------------------------

        meeting = Meeting(
            title="Weekly Product Sync",
            meeting_date=datetime(2026, 9, 24, 10, 30),
            duration_seconds=1845,
            participants=[parnika, rahul, ananya],
        )

        db.add(meeting)
        db.flush()

        # -------------------------
        # Transcript
        # -------------------------

        transcript = [
            TranscriptSegment(
                meeting_id=meeting.id,
                speaker_id=parnika.id,
                start_time=0,
                end_time=14,
                sequence_number=1,
                text=(
                    "Good morning everyone. Let's start with the product "
                    "updates and then go through the blockers for this week."
                ),
            ),
            TranscriptSegment(
                meeting_id=meeting.id,
                speaker_id=rahul.id,
                start_time=14,
                end_time=32,
                sequence_number=2,
                text=(
                    "The new dashboard API is almost complete. The meeting "
                    "search endpoint is working, but I still need to finish "
                    "participant filtering."
                ),
            ),
            TranscriptSegment(
                meeting_id=meeting.id,
                speaker_id=ananya.id,
                start_time=32,
                end_time=49,
                sequence_number=3,
                text=(
                    "The updated meeting library designs are ready. I also "
                    "finished the empty states and the mobile layout."
                ),
            ),
            TranscriptSegment(
                meeting_id=meeting.id,
                speaker_id=parnika.id,
                start_time=49,
                end_time=66,
                sequence_number=4,
                text=(
                    "Great. Let's prioritize participant filtering because "
                    "we need it for the customer demo on Friday."
                ),
            ),
            TranscriptSegment(
                meeting_id=meeting.id,
                speaker_id=rahul.id,
                start_time=66,
                end_time=84,
                sequence_number=5,
                text=(
                    "That works for me. I'll finish the filter endpoint "
                    "today and add API tests before handing it over."
                ),
            ),
            TranscriptSegment(
                meeting_id=meeting.id,
                speaker_id=ananya.id,
                start_time=84,
                end_time=103,
                sequence_number=6,
                text=(
                    "Once that's available I'll connect the filters to the "
                    "frontend and verify the loading and empty states."
                ),
            ),
            TranscriptSegment(
                meeting_id=meeting.id,
                speaker_id=parnika.id,
                start_time=103,
                end_time=120,
                sequence_number=7,
                text=(
                    "Perfect. I'll prepare the demo checklist and make sure "
                    "we have everything ready before Friday."
                ),
            ),
        ]

        db.add_all(transcript)

        # -------------------------
        # AI Summary
        # -------------------------

        summary = Summary(
            meeting_id=meeting.id,
            overview=(
                "The team reviewed progress on the meeting dashboard and "
                "prepared for Friday's customer demo. The dashboard API and "
                "meeting library designs are nearly complete. Participant "
                "filtering was identified as the main remaining priority."
            ),
        )

        db.add(summary)

        # -------------------------
        # Action Items
        # -------------------------

        action_items = [
            ActionItem(
                meeting_id=meeting.id,
                assignee_id=rahul.id,
                text="Finish participant filtering and add API tests.",
                is_completed=False,
            ),
            ActionItem(
                meeting_id=meeting.id,
                assignee_id=ananya.id,
                text="Connect participant filters to the meeting library UI.",
                is_completed=False,
            ),
            ActionItem(
                meeting_id=meeting.id,
                assignee_id=parnika.id,
                text="Prepare the customer demo checklist for Friday.",
                is_completed=False,
            ),
        ]

        db.add_all(action_items)

        # -------------------------
        # Chapters / Key Topics
        # -------------------------

        chapters = [
            Chapter(
                meeting_id=meeting.id,
                title="Product Updates",
                start_time=0,
                summary="The team shared progress across backend and design.",
                sequence_number=1,
            ),
            Chapter(
                meeting_id=meeting.id,
                title="Participant Filtering",
                start_time=49,
                summary="Participant filtering was prioritized for the demo.",
                sequence_number=2,
            ),
            Chapter(
                meeting_id=meeting.id,
                title="Next Steps",
                start_time=84,
                summary="Owners agreed on tasks required before Friday.",
                sequence_number=3,
            ),
        ]

        db.add_all(chapters)

        # -------------------------
        # Additional seeded meetings
        # -------------------------

        security_review = Meeting(
            title="Application Security Review",
            meeting_date=datetime(2026, 9, 23, 15, 0),
            duration_seconds=2712,
            participants=[parnika, aditya, rahul],
        )

        customer_discovery = Meeting(
            title="Customer Discovery - Acme",
            meeting_date=datetime(2026, 9, 22, 11, 15),
            duration_seconds=2235,
            participants=[meera, parnika, arjun],
        )

        engineering_standup = Meeting(
            title="Engineering Standup",
            meeting_date=datetime(2026, 9, 21, 9, 30),
            duration_seconds=1084,
            participants=[rahul, aditya, arjun],
        )

        design_review = Meeting(
            title="Mobile App Design Review",
            meeting_date=datetime(2026, 9, 19, 14, 0),
            duration_seconds=3150,
            participants=[ananya, meera, parnika],
        )

        quarterly_review = Meeting(
            title="Q3 Marketing Review",
            meeting_date=datetime(2026, 9, 17, 16, 0),
            duration_seconds=3665,
            participants=[meera, ananya, arjun],
        )

        db.add_all([
            security_review,
            customer_discovery,
            engineering_standup,
            design_review,
            quarterly_review,
        ])

        db.flush()
        additional_summaries = [
            Summary(
                meeting_id=security_review.id,
                overview=(
                    "The engineering and security teams reviewed authentication, "
                    "API authorization, input validation, and outstanding security "
                    "findings before the next release."
                ),
            ),
            Summary(
                meeting_id=customer_discovery.id,
                overview=(
                    "The team discussed Acme's meeting workflow, reporting needs, "
                    "and challenges finding decisions and action items across calls."
                ),
            ),
            Summary(
                meeting_id=engineering_standup.id,
                overview=(
                    "Engineering shared progress on the API, frontend integration, "
                    "testing, and current blockers."
                ),
            ),
            Summary(
                meeting_id=design_review.id,
                overview=(
                    "The team reviewed the mobile meeting experience, navigation, "
                    "transcript readability, and responsive layouts."
                ),
            ),
            Summary(
                meeting_id=quarterly_review.id,
                overview=(
                    "Marketing reviewed Q3 campaign performance, customer engagement, "
                    "content results, and priorities for the next quarter."
                ),
            ),
        ]

        db.add_all(additional_summaries)
        additional_transcript = [
            TranscriptSegment(
                meeting_id=security_review.id,
                speaker_id=aditya.id,
                start_time=0,
                end_time=18,
                sequence_number=1,
                text="Let's start with the security findings from this week's review.",
            ),
            TranscriptSegment(
                meeting_id=security_review.id,
                speaker_id=parnika.id,
                start_time=18,
                end_time=39,
                sequence_number=2,
                text=(
                    "The main concern is authorization on a few API endpoints. "
                    "Authentication works, but we need stronger object-level checks."
                ),
            ),
            TranscriptSegment(
                meeting_id=security_review.id,
                speaker_id=rahul.id,
                start_time=39,
                end_time=57,
                sequence_number=3,
                text=(
                    "I'll update those endpoints and add tests for unauthorized "
                    "resource access."
                ),
            ),

            TranscriptSegment(
                meeting_id=customer_discovery.id,
                speaker_id=meera.id,
                start_time=0,
                end_time=20,
                sequence_number=1,
                text="Could you walk us through how your team currently handles meeting notes?",
            ),
            TranscriptSegment(
                meeting_id=customer_discovery.id,
                speaker_id=arjun.id,
                start_time=20,
                end_time=44,
                sequence_number=2,
                text=(
                    "Our biggest problem is finding decisions after meetings. "
                    "Notes are spread across documents and chat messages."
                ),
            ),
            TranscriptSegment(
                meeting_id=customer_discovery.id,
                speaker_id=parnika.id,
                start_time=44,
                end_time=62,
                sequence_number=3,
                text=(
                    "A searchable transcript and centralized action items could "
                    "reduce that manual work significantly."
                ),
            ),

            TranscriptSegment(
                meeting_id=engineering_standup.id,
                speaker_id=rahul.id,
                start_time=0,
                end_time=16,
                sequence_number=1,
                text="Yesterday I completed the meeting search endpoint and its tests.",
            ),
            TranscriptSegment(
                meeting_id=engineering_standup.id,
                speaker_id=aditya.id,
                start_time=16,
                end_time=34,
                sequence_number=2,
                text="I'm reviewing authorization and error handling today.",
            ),
            TranscriptSegment(
                meeting_id=engineering_standup.id,
                speaker_id=arjun.id,
                start_time=34,
                end_time=51,
                sequence_number=3,
                text="I'll finish the deployment configuration and run the smoke tests.",
            ),

            TranscriptSegment(
                meeting_id=design_review.id,
                speaker_id=ananya.id,
                start_time=0,
                end_time=19,
                sequence_number=1,
                text="The main change is a cleaner transcript layout on smaller screens.",
            ),
            TranscriptSegment(
                meeting_id=design_review.id,
                speaker_id=meera.id,
                start_time=19,
                end_time=41,
                sequence_number=2,
                text="The hierarchy looks better, but the meeting actions need more spacing.",
            ),
            TranscriptSegment(
                meeting_id=design_review.id,
                speaker_id=parnika.id,
                start_time=41,
                end_time=58,
                sequence_number=3,
                text="Let's keep the transcript as the primary focus on mobile.",
            ),

            TranscriptSegment(
                meeting_id=quarterly_review.id,
                speaker_id=meera.id,
                start_time=0,
                end_time=21,
                sequence_number=1,
                text="Q3 engagement improved, particularly for product education content.",
            ),
            TranscriptSegment(
                meeting_id=quarterly_review.id,
                speaker_id=ananya.id,
                start_time=21,
                end_time=43,
                sequence_number=2,
                text="The strongest campaigns were the workflow guides and customer stories.",
            ),
            TranscriptSegment(
                meeting_id=quarterly_review.id,
                speaker_id=arjun.id,
                start_time=43,
                end_time=60,
                sequence_number=3,
                text="For Q4 we should measure conversion from those campaigns more closely.",
            ),
        ]

        db.add_all(additional_transcript)

        additional_action_items = [
            ActionItem(
                meeting_id=security_review.id,
                assignee_id=rahul.id,
                text="Add object-level authorization checks to affected API endpoints.",
            ),
            ActionItem(
                meeting_id=security_review.id,
                assignee_id=aditya.id,
                text="Re-test authorization findings before release.",
            ),
            ActionItem(
                meeting_id=customer_discovery.id,
                assignee_id=meera.id,
                text="Document Acme's requirements and workflow pain points.",
            ),
            ActionItem(
                meeting_id=engineering_standup.id,
                assignee_id=arjun.id,
                text="Run deployment smoke tests.",
            ),
            ActionItem(
                meeting_id=design_review.id,
                assignee_id=ananya.id,
                text="Update spacing for mobile meeting actions.",
            ),
            ActionItem(
                meeting_id=quarterly_review.id,
                assignee_id=meera.id,
                text="Prepare Q4 campaign measurement plan.",
            ),
        ]

        db.add_all(additional_action_items)

        db.commit()

        print("Database seeded successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

def seed_if_empty():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        existing_meeting = db.query(Meeting).first()

        if existing_meeting:
            print("Database already contains meetings. Skipping seed.")
            return

    finally:
        db.close()

    reset_and_seed_database()

if __name__ == "__main__":
    reset_and_seed_database()