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

        transcript_data = [
            # sequence, speaker, start, end, text
            (
                1,
                parnika,
                0,
                75,
                "Good morning everyone. Let's start with our weekly product sync. "
                "Today I want to review engineering progress, the meeting library, "
                "search and filtering, and everything we still need for Friday's customer demo.",
            ),
            (
                2,
                rahul,
                75,
                165,
                "On the backend side, the main meeting APIs are working now. "
                "We can list meetings, retrieve an individual meeting, and return the "
                "participants, transcript, summary, chapters, and action items together.",
            ),
            (
                3,
                ananya,
                165,
                255,
                "The meeting library design is also in good shape. I simplified the "
                "navigation, improved the spacing between meeting rows, and made the "
                "participant information easier to scan without overcrowding the page.",
            ),
            (
                4,
                parnika,
                255,
                345,
                "That sounds good. For the demo, the experience should feel fast and "
                "focused. A user should be able to open the library, find a meeting, "
                "and understand the important information without learning the interface first.",
            ),
            (
                5,
                rahul,
                345,
                435,
                "Search by meeting title is complete. I also added participant matching, "
                "so searching for a person's name returns meetings they attended. "
                "The endpoint still keeps the newest meetings first.",
            ),
            (
                6,
                ananya,
                435,
                525,
                "I'll connect those search states to the frontend. We should show a "
                "loading state while the request is running and a clear empty state "
                "when no meetings match the current query.",
            ),
            (
                7,
                parnika,
                525,
                615,
                "Let's make sure filtering works independently as well. We need title "
                "search, participant filtering, and date filtering. Combining them should "
                "also work because someone may remember the attendee but not the meeting title.",
            ),
            (
                8,
                rahul,
                615,
                705,
                "The query structure already supports that. Participant filtering joins "
                "the participant relationship, while the date filter constrains the meeting "
                "timestamp. I added distinct results so the joins don't duplicate meetings.",
            ),
            (
                9,
                ananya,
                705,
                795,
                "For the detail view, I want to keep AI notes and the transcript visible "
                "side by side. The notes panel can contain the overview, action items, "
                "meeting outline, and participants while the transcript remains the primary reference.",
            ),
            (
                10,
                parnika,
                795,
                885,
                "Agreed. The transcript interaction is especially important. Clicking a "
                "transcript line should move playback to that timestamp, and playback should "
                "visually indicate which transcript segment is currently active.",
            ),
            (
                11,
                rahul,
                885,
                975,
                "We can use one current-time value as the source of truth. The player, "
                "seek bar, transcript highlight, and chapter navigation can all derive their "
                "state from that same value instead of maintaining separate synchronization logic.",
            ),
            (
                12,
                ananya,
                975,
                1065,
                "That will also make the interface easier to reason about. I'll make the "
                "active transcript segment visually distinct but subtle enough that the user "
                "can continue reading surrounding lines.",
            ),
            (
                13,
                parnika,
                1065,
                1155,
                "Let's cover editing as well. Meeting titles, action items, and transcript "
                "text should persist after refresh. We don't need complicated collaborative "
                "editing for this version, but the core CRUD workflow has to feel complete.",
            ),
            (
                14,
                rahul,
                1155,
                1245,
                "Action item create, update, complete, and delete operations are straightforward. "
                "I'll keep those endpoints separate from the meeting routes so the API stays "
                "modular and each router has a clear responsibility.",
            ),
            (
                15,
                ananya,
                1245,
                1335,
                "On the frontend I'll make the completed state immediately visible and "
                "provide feedback after changes. We should avoid controls that look clickable "
                "but don't actually do anything in the final demo.",
            ),
            (
                16,
                parnika,
                1335,
                1425,
                "For meeting creation, let's keep the workflow simple. Users can enter "
                "metadata and paste a transcript, or upload a text file. We don't need real "
                "speech-to-text because that's explicitly outside the scope of this project.",
            ),
            (
                17,
                rahul,
                1425,
                1515,
                "The transcript parser can treat each non-empty line as a segment. If the "
                "line begins with a speaker name followed by a colon, we associate that segment "
                "with the participant and generate simple timestamps.",
            ),
            (
                18,
                ananya,
                1515,
                1605,
                "For the creation modal I'll clearly explain the speaker-colon-text format. "
                "Uploading a text file can simply populate the same transcript field, which "
                "keeps the frontend and backend implementation much smaller.",
            ),
            (
                19,
                parnika,
                1605,
                1695,
                "The remaining concern is deployment. We already have the frontend and "
                "backend hosted, so after the functionality is stable we should verify the "
                "production API, seeded data, and the complete create-edit-delete journey.",
            ),
            (
                20,
                rahul,
                1695,
                1765,
                "I'll also run the production build and API smoke tests before the final "
                "submission. That should catch TypeScript issues or missing Python dependencies "
                "that development mode might not expose.",
            ),
            (
                21,
                ananya,
                1765,
                1815,
                "I'll do one final interface pass after that: spacing, empty states, modals, "
                "notifications, and the placeholder experiences for integrations and live capture.",
            ),
            (
                22,
                parnika,
                1815,
                1845,
                "Perfect. Rahul will finish the API and deployment checks, Ananya will do "
                "the interface pass, and I'll prepare the customer demo checklist. "
                "Let's have everything ready before Friday.",
            ),
        ]

        transcript = [
            TranscriptSegment(
                meeting_id=meeting.id,
                speaker_id=speaker.id,
                start_time=start_time,
                end_time=end_time,
                text=text,
                sequence_number=sequence_number,
            )
            for (
                sequence_number,
                speaker,
                start_time,
                end_time,
                text,
            ) in transcript_data
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
                title="Product & Engineering Updates",
                start_time=0,
                summary=(
                    "The team reviewed backend progress, the meeting library, "
                    "and the priorities for the customer demo."
                ),
                sequence_number=1,
            ),
            Chapter(
                meeting_id=meeting.id,
                title="Search & Filtering",
                start_time=345,
                summary=(
                    "The team discussed title search, participant filtering, "
                    "date filtering, and combined meeting queries."
                ),
                sequence_number=2,
            ),
            Chapter(
                meeting_id=meeting.id,
                title="Transcript Experience",
                start_time=705,
                summary=(
                    "The meeting detail layout and synchronized transcript "
                    "playback experience were reviewed."
                ),
                sequence_number=3,
            ),
            Chapter(
                meeting_id=meeting.id,
                title="Editing & Action Items",
                start_time=1065,
                summary=(
                    "The team reviewed persistent transcript editing, meeting "
                    "metadata updates, and action item workflows."
                ),
                sequence_number=4,
            ),
            Chapter(
                meeting_id=meeting.id,
                title="Meeting Creation",
                start_time=1335,
                summary=(
                    "The team agreed on a simple pasted transcript and text-file "
                    "upload workflow for creating meetings."
                ),
                sequence_number=5,
            ),
            Chapter(
                meeting_id=meeting.id,
                title="Deployment & Final QA",
                start_time=1605,
                summary=(
                    "Production deployment, build checks, UI polish, and final "
                    "demo responsibilities were discussed."
                ),
                sequence_number=6,
            ),
            Chapter(
                meeting_id=meeting.id,
                title="Next Steps",
                start_time=1815,
                summary=(
                    "Owners confirmed the final API, UI, deployment, and demo tasks."
                ),
                sequence_number=7,
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