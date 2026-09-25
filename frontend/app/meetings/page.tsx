"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { getMeetings } from "../../lib/api";
import type { Meeting } from "../../lib/types";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [search, setSearch] = useState("");
  const [participant, setParticipant] = useState("");
  const [meetingDate, setMeetingDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMeetings({
          search: search || undefined,
          participant: participant || undefined,
          meetingDate: meetingDate || undefined,
        });

        setMeetings(data);
      } catch (err) {
        console.error("Failed to load meetings:", err);
        setError("Unable to load meetings.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadMeetings, 250);

    return () => clearTimeout(timer);
  }, [search, participant, meetingDate]);

  return (
    <div className="min-h-screen bg-[#121212] text-[#ededed]">
      <Sidebar />
      <Topbar />

      <main className="ml-[60px] pt-[72px]">
        <div className="mx-auto max-w-[1180px] px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[25px] font-semibold tracking-tight">
                Meetings
              </h1>

              <p className="mt-1 text-sm text-[#8e8e8e]">
                Review your meeting notes, transcripts and action items.
              </p>
            </div>

            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-md border border-[#343434] bg-[#1c1c1c] px-4 text-sm text-[#d4d4d4] transition-colors hover:bg-[#242424]"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex h-10 min-w-[280px] flex-1 items-center gap-2 rounded-md border border-[#353535] bg-[#191919] px-3">
              <Search size={17} className="shrink-0 text-[#777]" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search meetings"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#777]"
              />
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#858585]"
              />

              <input
                type="text"
                value={participant}
                onChange={(event) => setParticipant(event.target.value)}
                placeholder="Participant"
                className="h-10 w-[175px] rounded-md border border-[#353535] bg-[#191919] pl-9 pr-3 text-sm text-white outline-none placeholder:text-[#777]"
              />
            </div>

            <div className="relative">
              <Calendar
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#858585]"
              />

              <input
                type="date"
                value={meetingDate}
                onChange={(event) => setMeetingDate(event.target.value)}
                className="h-10 rounded-md border border-[#353535] bg-[#191919] pl-9 pr-3 text-sm text-[#cfcfcf] outline-none"
              />
            </div>
          </div>

          <div className="mt-9 flex items-center justify-between border-b border-[#292929] pb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-medium">
                My Meetings
              </h2>

              {!loading && !error && (
                <span className="rounded-full bg-[#292929] px-2 py-0.5 text-xs text-[#aaa]">
                  {meetings.length}
                </span>
              )}
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 text-sm text-[#a3a3a3] transition-colors hover:text-white"
            >
              Most recent
              <ChevronDown size={15} />
            </button>
          </div>

          <div>
            {loading && <MeetingsLoading />}

            {!loading && error && (
              <div className="py-20 text-center">
                <div className="text-sm text-red-400">
                  {error}
                </div>

                <p className="mt-2 text-xs text-[#777]">
                  Make sure the FastAPI backend is running.
                </p>
              </div>
            )}

            {!loading && !error && meetings.length === 0 && (
              <div className="py-24 text-center">
                <div className="text-[16px] font-medium">
                  No meetings found
                </div>

                <p className="mt-2 text-sm text-[#777]">
                  Try changing your search or filters.
                </p>
              </div>
            )}

            {!loading &&
              !error &&
              meetings.map((meeting) => (
                <MeetingRow key={meeting.id} meeting={meeting} />
              ))}
          </div>
        </div>
      </main>

      <button
        type="button"
        aria-label="Help"
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#d9d2ff] font-semibold text-[#20185c] shadow-xl"
      >
        ?
      </button>
    </div>
  );
}

function MeetingRow({ meeting }: { meeting: Meeting }) {
  const router = useRouter();

  const openMeeting = () => {
    router.push(`/meetings/${meeting.id}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openMeeting}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openMeeting();
        }
      }}
      className="group flex w-full cursor-pointer items-center border-b border-[#252525] px-3 py-5 text-left transition-colors hover:bg-[#191919]"
    >
      <ParticipantAvatars meeting={meeting} />

      <div className="ml-4 min-w-0 flex-1">
        <div className="truncate text-[15px] font-medium text-[#ededed]">
          {meeting.title}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[13px] text-[#898989]">
          <span>{formatMeetingDate(meeting.meeting_date)}</span>
          <span>•</span>
          <span>{formatDuration(meeting.duration_seconds)}</span>
          <span>•</span>
          <span>{formatParticipantNames(meeting)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => event.stopPropagation()}
        className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#777] opacity-0 transition-all hover:bg-[#303030] hover:text-white group-hover:opacity-100"
        aria-label={`Actions for ${meeting.title}`}
      >
        <MoreHorizontal size={18} />
      </button>
    </div>
  );
}

function ParticipantAvatars({ meeting }: { meeting: Meeting }) {
  const visibleParticipants = meeting.participants.slice(0, 3);

  return (
    <div className="flex min-w-[68px] -space-x-2">
      {visibleParticipants.map((participant) => (
        <div
          key={participant.id}
          title={participant.name}
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#121212] text-xs font-semibold text-white"
          style={{
            backgroundColor: participant.avatar_color || "#555555",
          }}
        >
          {getInitials(participant.name)}
        </div>
      ))}
    </div>
  );
}

function MeetingsLoading() {
  return (
    <div className="space-y-1 py-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex animate-pulse items-center border-b border-[#252525] px-3 py-5"
        >
          <div className="h-9 w-16 rounded-full bg-[#252525]" />

          <div className="ml-4 flex-1">
            <div className="h-4 w-52 rounded bg-[#292929]" />
            <div className="mt-3 h-3 w-80 max-w-full rounded bg-[#222222]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatMeetingDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

function formatParticipantNames(meeting: Meeting) {
  const names = meeting.participants.map(
    (participant) => participant.name
  );

  if (names.length === 0) {
    return "No participants";
  }

  if (names.length <= 2) {
    return names.join(", ");
  }

  return `${names[0]}, ${names[1]} +${names.length - 2}`;
}