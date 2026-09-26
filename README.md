# Fireflies.ai Clone — Meeting Notes & Transcription Platform

A full-stack clone of the Fireflies.ai meeting assistant experience, built as an SDE Fullstack assignment.

The application recreates the core post-meeting workflow of Fireflies: users can browse meetings, search and filter their meeting library, open interactive transcripts, navigate through a synchronized meeting player, view AI-style notes and action items, edit meeting content, and persist changes through a FastAPI + SQLite backend.

> Real speech-to-text and live meeting bots are intentionally outside the scope of this project. Transcript and AI-note data are seeded or created from user-provided transcript text, as permitted by the assignment.

---

## Live Demo

**Frontend:** `https://fireflies-ai-clone-navy.vercel.app/`

**Backend API:** https://fireflies-clone-bivl.onrender.com

**Interactive API Documentation:** https://fireflies-clone-bivl.onrender.com/docs

> The backend is hosted on Render's free tier, so the first request after a period of inactivity may take a short time while the service wakes up.

## Features

### Meetings Library

- Fireflies-inspired meetings dashboard
- List of previous meetings
- Meeting title, date, duration and participants
- Search meetings by title
- Search meetings by participant
- Participant filtering
- Date filtering
- Sort by most recent or oldest
- Loading, empty and error states
- Participant avatars
- Dynamic navigation to individual meetings

### Interactive Meeting Notepad

Each meeting contains a Fireflies-style split workspace with:

- AI Notes panel
- Interactive transcript panel
- Speaker labels
- Speaker avatars
- Transcript timestamps
- Meeting overview
- Action items
- Meeting chapters / outline
- Participants
- Meeting metadata

### Interactive Meeting Player

The media player is intentionally simulated because real audio transcription is outside the assignment scope.

It supports:

- Play / pause
- Seek bar
- Current playback time
- Meeting duration
- Clicking a transcript segment seeks playback to its timestamp
- Playback automatically highlights the active transcript segment
- Active transcript automatically scrolls into view
- Clicking a meeting chapter seeks to that chapter
- Active chapter changes with playback
- Playback stops automatically at the end of the meeting

The player, transcript and chapters all derive their state from the same current playback time.

### Transcript Search

- Search within an individual transcript
- Case-insensitive matching
- Matching transcript segments are filtered
- Matching words are highlighted
- Match count is displayed

### Meeting CRUD

Users can:

- Create meetings
- View meetings
- Rename meetings
- Delete meetings
- Edit meeting metadata
- Add participants while creating a meeting
- Paste transcript text
- Upload a `.txt` transcript file

Meeting changes are persisted through the backend database.

### Transcript Editing

- Enter transcript edit mode
- Edit individual transcript segments
- Save changes
- Cancel unsaved changes
- Only modified segments are sent to the backend
- Updated transcript text persists after refresh

### Action Item CRUD

Users can:

- Add action items
- Edit action items
- Mark action items complete
- Reopen completed action items
- Delete action items

All changes persist through the backend.

### Notifications & Modals

The UI includes reusable:

- Success/error toasts
- Create Meeting modal
- Rename Meeting modal
- Delete confirmation modal
- Coming Soon modal

Unsupported Fireflies features are intentionally represented as placeholders rather than non-functional controls.

### Export — Bonus Feature

Meeting data can be exported directly from the browser as:

- Transcript — `.txt`
- AI Notes — `.md`

The Markdown export contains:

- Meeting metadata
- Overview
- Action items
- Meeting outline
- Participants

---

## Placeholder / Out-of-Scope Features

The following features are intentionally represented using **Coming Soon** placeholders:

- Real-time meeting bot
- Live meeting capture
- Real speech-to-text
- Calendar integrations
- Zoom / Google Meet integrations
- CRM integrations
- Team collaboration and sharing
- Real authentication
- Analytics
- Automations
- AskFred-style meeting chat

A default logged-in user is assumed.

---

# Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React
- Browser Blob API for exports

## Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

## Database

- SQLite

## Deployment

- Vercel — frontend
- Render — FastAPI backend
- GitHub — source control

---

# Architecture

The application follows a conventional client-server architecture:

```text
Browser
   |
   v
Next.js + TypeScript
   |
   | REST API / JSON
   v
FastAPI
   |
   v
SQLAlchemy ORM
   |
   v
SQLite
```

The frontend is responsible for presentation and interactive application state.

The FastAPI backend owns persistent meeting data and exposes REST endpoints.

SQLAlchemy provides the ORM layer between FastAPI and SQLite.

---

## Request Flow Example

Opening a meeting follows:

```text
User clicks meeting
    ->
Next.js navigates to /meetings/{id}
    ->
getMeeting(id)
    ->
GET /api/meetings/{id}
    ->
FastAPI router
    ->
SQLAlchemy query
    ->
SQLite
    ->
Meeting JSON
    ->
React renders Notepad
```

Updating an action item follows:

```text
User checks action item
    ->
PATCH /api/action-items/{id}
    ->
FastAPI validates request
    ->
SQLAlchemy updates ActionItem
    ->
SQLite commit
    ->
Updated ActionItem returned
    ->
React updates local UI state
```

---

# Project Structure

```text
fireflies-clone/
|
|-- frontend/
|   |
|   |-- app/
|   |   |-- page.tsx
|   |   |-- layout.tsx
|   |   |-- globals.css
|   |   |
|   |   `-- meetings/
|   |       |-- page.tsx
|   |       |
|   |       `-- [id]/
|   |           `-- page.tsx
|   |
|   |-- components/
|   |   |
|   |   |-- layout/
|   |   |   |-- Sidebar.tsx
|   |   |   `-- Topbar.tsx
|   |   |
|   |   |-- meetings/
|   |   |   |-- CreateMeetingModal.tsx
|   |   |   |-- DeleteMeetingModal.tsx
|   |   |   |-- MeetingActions.tsx
|   |   |   `-- RenameMeetingModal.tsx
|   |   |
|   |   `-- ui/
|   |       |-- ComingSoonModal.tsx
|   |       |-- Logo.tsx
|   |       `-- Toast.tsx
|   |
|   |-- lib/
|   |   |-- api.ts
|   |   `-- types.ts
|   |
|   |-- public/
|   |-- package.json
|   `-- tsconfig.json
|
|-- backend/
|   |
|   |-- app/
|   |   |-- main.py
|   |   |-- database.py
|   |   |-- seed.py
|   |   |
|   |   |-- models/
|   |   |
|   |   |-- routers/
|   |   |   |-- meetings.py
|   |   |   |-- action_items.py
|   |   |   `-- transcripts.py
|   |   |
|   |   `-- schemas/
|   |
|   `-- requirements.txt
|
|-- .gitignore
`-- README.md
```

---

# Database Design

The database is designed around meetings and their related post-meeting content.

## Main Entities

### Meeting

Represents one recorded meeting.

Stores information such as:

- title
- meeting date
- duration

A meeting can contain multiple participants, transcript segments, chapters and action items.

### Participant

Represents a person who attended or spoke during a meeting.

Participants can belong to multiple meetings.

### TranscriptSegment

Represents one timestamped section of the transcript.

Each segment contains:

- meeting reference
- speaker reference
- start time
- end time
- transcript text
- sequence number

### Summary

Stores the generated or seeded AI-style meeting overview.

### Chapter

Represents a topic or section within a meeting.

Each chapter contains:

- meeting reference
- title
- start timestamp
- summary
- sequence number

### ActionItem

Represents a task identified during a meeting.

Stores:

- meeting reference
- optional assignee
- task text
- completion state

---

## Relationships

```text
Participant
    ^
    |
    | many-to-many
    |
Meeting
    |
    |-- 1 : many --> TranscriptSegment
    |
    |-- 1 : 1 ----> Summary
    |
    |-- 1 : many --> Chapter
    |
    `-- 1 : many --> ActionItem
```

A transcript segment can optionally reference a Participant as its speaker.

An action item can optionally reference a Participant as its assignee.

Participants are not deleted when a meeting is deleted because the same participant may belong to other meetings.

Meeting-owned content is removed with its parent meeting.

---

# API Design

The backend uses REST-style endpoints.

## Meetings

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/meetings` | Retrieve meetings |
| GET | `/api/meetings/{meeting_id}` | Retrieve a complete meeting |
| POST | `/api/meetings` | Create a meeting |
| PATCH | `/api/meetings/{meeting_id}` | Update meeting metadata |
| DELETE | `/api/meetings/{meeting_id}` | Delete a meeting |

## Action Items

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/meetings/{meeting_id}/action-items` | Create an action item |
| PATCH | `/api/action-items/{action_item_id}` | Edit or complete an action item |
| DELETE | `/api/action-items/{action_item_id}` | Delete an action item |

## Transcript

| Method | Endpoint | Description |
|---|---|---|
| PATCH | `/api/transcript-segments/{segment_id}` | Update transcript segment text |

## System

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API root |
| GET | `/health` | Backend health check |
| GET | `/docs` | Swagger / OpenAPI documentation |

FastAPI automatically generates interactive Swagger documentation at `/docs`.

---

# Meeting Creation

A meeting can be created by providing:

- title
- date/time
- duration
- participant names
- transcript text

The frontend also supports selecting a `.txt` file.

The file is read in the browser and its contents are submitted using the same meeting creation API.

---

## Transcript Input Format

The simple supported format is:

```text
Parnika Sarbahi: Good morning everyone.
Rahul Mehta: The API is ready for testing.
Ananya Sharma: I will finish the interface updates.
```

The backend parses each non-empty line.

When a line follows:

```text
Speaker Name: Transcript text
```

the speaker is associated with that transcript segment.

If a participant does not already exist, the backend can create the participant and associate them with the meeting.

Generated transcript timestamps are used because actual speech-to-text is intentionally outside scope.

---

# Seed Data

The application includes a seeded dataset so the interface is immediately usable.

The seed contains multiple meetings with:

- participants
- transcripts
- summaries
- action items
- chapters

The primary **Weekly Product Sync** meeting contains a complete transcript covering its full `30:45` duration so the player, transcript highlighting and chapter navigation can be demonstrated across the complete timeline.

---

## Reset Local Database

From the backend directory:

```bash
python -m app.seed
```

This is a development command.

**Warning:** it intentionally resets the local database before recreating the seeded demo data.

---

## Production Initialization

Production uses a separate safe initialization strategy.

On application startup:

```text
Create tables if necessary
        |
        v
Does the database already contain meetings?
        |
       Yes -----------------> Keep existing data
        |
        No
        |
        v
Seed demo meetings
```

This prevents normal application startup from repeatedly overwriting an existing database.

---

# Local Development Setup

## Prerequisites

Install:

- Node.js 20+
- npm
- Python 3.11+
- Git

The project was developed using:

- Node.js 22
- Python 3.11

---

## 1. Clone Repository

```bash
git clone https://github.com/ParnikaSarbahi/fireflies-clone.git
cd fireflies-clone
```

---

## 2. Backend Setup

```bash
cd backend
```

Create a virtual environment:

### Windows

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Seed the local database:

```bash
python -m app.seed
```

Start FastAPI:

```bash
python -m uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

---

# 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Start Next.js:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Meetings Library:

```text
http://localhost:3000/meetings
```

Example meeting:

```text
http://localhost:3000/meetings/1
```

---

# Environment Variables

## Frontend

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

In production this points to the deployed Render backend.

No API keys are required for the core application.

---

# Deployment

## Frontend — Vercel

The Next.js frontend is deployed on Vercel.

The production environment defines:

```env
NEXT_PUBLIC_API_URL=https://fireflies-clone-bivl.onrender.com
```

Because this is a `NEXT_PUBLIC_*` variable, it is embedded into the frontend during the Vercel build.

---

## Backend — Render

The FastAPI backend is deployed on Render.

Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

The backend exposes:

```text
https://fireflies-clone-bivl.onrender.com
```

Health check:

```text
https://fireflies-clone-bivl.onrender.com/health
```

---

## SQLite on Free Hosting

SQLite is used because it is the database specified for the assignment.

The free Render filesystem is ephemeral and does not provide a free persistent disk. Therefore, data persists normally during the lifetime of the current service filesystem, but a service replacement or redeployment may recreate the SQLite database.

To keep the hosted demo immediately usable, the backend safely seeds the database when it starts with an empty database.

For a production system requiring durable hosted persistence, the deployment would use persistent storage while preserving the same application data model.

---

# Important Design Decisions

## Why FastAPI?

FastAPI provides:

- straightforward REST API development
- Pydantic request validation
- automatic OpenAPI documentation
- clean router separation
- strong compatibility with SQLAlchemy

---

## Why SQLAlchemy?

Using an ORM keeps database operations separate from raw SQL and makes relationships between meetings, participants, transcripts, chapters and action items explicit.

---

## Why Separate Routers?

Backend responsibilities are separated into:

```text
meetings.py
action_items.py
transcripts.py
```

This avoids placing every endpoint in one large module and keeps each resource easier to understand and maintain.

---

## Why PATCH for Editing?

Updates such as:

```json
{
  "is_completed": true
}
```

should not require resending the entire resource.

`PATCH` allows partial updates for:

- meeting metadata
- action items
- transcript segments

---

## Why a Simulated Media Player?

Actual speech-to-text and audio processing are explicitly outside the assignment scope.

The simulated player focuses on the interaction being evaluated:

```text
Playback time
      |
      |----> Seek bar
      |
      |----> Active transcript
      |
      `----> Active chapter
```

A single playback time acts as the source of truth for synchronization.

---

## Why Client-Side TXT Upload?

The assignment allows uploaded transcript files.

For `.txt` files, the browser reads the file using `FileReader` and sends its contents through the existing meeting creation API.

This avoids creating a second upload pipeline when the backend ultimately needs transcript text.

---

## Why Seeded AI Notes?

Real LLM generation is optional in the assignment.

The project uses seeded/mock AI-style summaries, action items and chapters so the evaluator can immediately test the complete post-meeting workflow without requiring an external API key or paid AI service.

---

# Assumptions

- A default user is already logged in.
- Authentication is outside scope.
- Meeting audio/video is represented by a simulated player.
- Speech-to-text is outside scope.
- AI summaries may be seeded/mock data.
- Transcript creation uses pasted or uploaded text.
- Collaboration features are placeholders.
- Integrations are placeholders.
- The application prioritizes the post-meeting Fireflies experience.

---

# Validation & Error Handling

The application handles cases such as:

- invalid meeting IDs
- missing meetings
- empty meeting titles
- negative meeting durations
- empty transcript edits
- invalid action-item assignees
- empty action-item text
- API request failures
- empty search results
- missing summaries/chapters/action items

The frontend includes loading, empty and error states where appropriate.

---

# Testing

## Frontend Quality Checks

```bash
cd frontend
npm run lint
npm run build
```

The application has been checked using the Next.js production build in addition to development mode.

---

## Backend Smoke Test

Start FastAPI:

```bash
python -m uvicorn app.main:app
```

Verify:

```text
GET /health
GET /api/meetings
GET /api/meetings/1
GET /docs
```

---

## Recommended Demo Flow

For evaluation, the main functionality can be demonstrated with:

```text
Home
  ->
Meetings Library
  ->
Search / Filter Meetings
  ->
Open Weekly Product Sync
  ->
Play Meeting
  ->
Observe Active Transcript
  ->
Click Transcript Timestamp
  ->
Seek to Chapter
  ->
Search Transcript
  ->
Edit Transcript
  ->
Complete / Add / Edit Action Item
  ->
Rename Meeting
  ->
Export Transcript / AI Notes
  ->
Create Meeting from Transcript
  ->
Refresh to Verify Persistence
```

---

# Assignment Coverage

| Requirement | Implementation |
|---|---|
| Meetings library | Implemented |
| Meeting title/date/duration/participants | Implemented |
| Search meetings | Implemented |
| Filter meetings | Implemented |
| Sort by recency | Implemented |
| Navigation | Implemented |
| Interactive transcript | Implemented |
| Speaker labels | Implemented |
| Timestamps | Implemented |
| Media player area | Implemented |
| Transcript -> player seeking | Implemented |
| Player -> transcript synchronization | Implemented |
| Transcript search | Implemented |
| Highlighted search matches | Implemented |
| AI summary | Implemented with seeded data |
| Action items | Implemented |
| Chapters / outline | Implemented |
| Create meeting | Implemented |
| Edit meeting | Implemented |
| Delete meeting | Implemented |
| Add/edit/complete action items | Implemented |
| Persistent SQLite data | Implemented |
| Forms and modals | Implemented |
| Notifications / toasts | Implemented |
| Settings placeholders | Implemented |
| Seed data | Implemented |
| `.txt` transcript upload | Implemented |
| Transcript editing | Implemented |
| Export transcript | Bonus implemented |
| Export AI notes | Bonus implemented |
| Real authentication | Placeholder / out of scope |
| Real-time meeting bot | Placeholder / out of scope |
| Speech-to-text | Out of scope |
| Integrations | Placeholder / out of scope |
| Collaboration | Placeholder / out of scope |

---

# AI Tool Usage

AI-assisted development was used during implementation, as explicitly permitted and encouraged by the assignment.

AI tools were used for:

- implementation planning
- debugging
- UI iteration
- API design discussion
- code review
- documentation assistance

All submitted code was integrated and tested as part of the project implementation.

---

# Future Improvements

With additional development time, the application could be extended with:

- real audio/video playback
- speech-to-text transcription
- LLM-generated summaries
- AskFred-style meeting Q&A
- PDF export
- global transcript search
- transcript highlights and soundbites
- comments
- tags/topics
- calendar integration
- Zoom / Google Meet integration
- real authentication
- collaborative workspaces
- persistent production storage

---

# Author

**Parnika Sarbahi**

SDE Fullstack Assignment — Fireflies.ai Clone
