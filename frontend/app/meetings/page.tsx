"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  CalendarDays,
  ChevronDown,
  Plus,
  Search,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

import CreateMeetingModal from "../../components/meetings/CreateMeetingModal";
import DeleteMeetingModal from "../../components/meetings/DeleteMeetingModal";
import MeetingActions from "../../components/meetings/MeetingActions";
import RenameMeetingModal from "../../components/meetings/RenameMeetingModal";

import Toast from "../../components/ui/Toast";

import {
  deleteMeeting,
  getMeetings,
  updateMeeting,
} from "../../lib/api";

import type {
  Meeting,
  MeetingDetail,
} from "../../lib/types";

type ToastState = {
  message: string;
  type: "success" | "error";
};

export default function MeetingsPage() {
  const router = useRouter();

  // ============================================================
  // Meeting data
  // ============================================================

  const [meetings, setMeetings] =
    useState<Meeting[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ============================================================
  // Filters
  // ============================================================

  const [search, setSearch] =
    useState("");

  const [participant, setParticipant] =
    useState("");

  const [meetingDate, setMeetingDate] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState<"recent" | "oldest">(
      "recent"
    );

  // ============================================================
  // Modals
  // ============================================================

  const [
    showCreateMeeting,
    setShowCreateMeeting,
  ] = useState(false);

  const [
    meetingToRename,
    setMeetingToRename,
  ] = useState<Meeting | null>(
    null
  );

  const [
    meetingToDelete,
    setMeetingToDelete,
  ] = useState<Meeting | null>(
    null
  );

  const [
    deletingMeeting,
    setDeletingMeeting,
  ] = useState(false);

  // ============================================================
  // Toast
  // ============================================================

  const [toast, setToast] =
    useState<ToastState | null>(
      null
    );

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({
      message,
      type,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // ============================================================
  // Load meetings
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadMeetings =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getMeetings();

          if (!cancelled) {
            setMeetings(data);
          }
        } catch (err) {
          console.error(
            "Failed to load meetings:",
            err
          );

          if (!cancelled) {
            setError(
              "Could not load meetings."
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadMeetings();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // Client-side filtering / sorting
  // ============================================================

  const filteredMeetings =
    useMemo(() => {
      const searchTerm =
        search
          .trim()
          .toLowerCase();

      const participantTerm =
        participant
          .trim()
          .toLowerCase();

      const result =
        meetings.filter(
          (meeting) => {
            const matchesSearch =
              !searchTerm ||
              meeting.title
                .toLowerCase()
                .includes(
                  searchTerm
                ) ||
              meeting.participants.some(
                (person) =>
                  person.name
                    .toLowerCase()
                    .includes(
                      searchTerm
                    )
              );

            const matchesParticipant =
              !participantTerm ||
              meeting.participants.some(
                (person) =>
                  person.name
                    .toLowerCase()
                    .includes(
                      participantTerm
                    )
              );

            const matchesDate =
              !meetingDate ||
              getDateInputValue(
                meeting.meeting_date
              ) === meetingDate;

            return (
              matchesSearch &&
              matchesParticipant &&
              matchesDate
            );
          }
        );

      return [...result].sort(
        (a, b) => {
          const first =
            new Date(
              a.meeting_date
            ).getTime();

          const second =
            new Date(
              b.meeting_date
            ).getTime();

          return sortOrder ===
            "recent"
            ? second - first
            : first - second;
        }
      );
    }, [
      meetings,
      search,
      participant,
      meetingDate,
      sortOrder,
    ]);

  // ============================================================
  // Meeting CRUD
  // ============================================================

  const handleRenameMeeting =
    async (
      newTitle: string
    ) => {
      if (!meetingToRename) {
        return;
      }

      const updated =
        await updateMeeting(
          meetingToRename.id,
          {
            title: newTitle,
          }
        );

      setMeetings(
        (current) =>
          current.map(
            (meeting) =>
              meeting.id ===
              updated.id
                ? {
                    ...meeting,
                    title:
                      updated.title,
                  }
                : meeting
          )
      );

      setMeetingToRename(
        null
      );

      showToast(
        "Meeting renamed"
      );
    };

  const handleDeleteMeeting =
    async () => {
      if (!meetingToDelete) {
        return;
      }

      try {
        setDeletingMeeting(
          true
        );

        const meetingId =
          meetingToDelete.id;

        await deleteMeeting(
          meetingId
        );

        setMeetings(
          (current) =>
            current.filter(
              (meeting) =>
                meeting.id !==
                meetingId
            )
        );

        setMeetingToDelete(
          null
        );

        showToast(
          "Meeting deleted"
        );
      } catch (err) {
        console.error(err);

        showToast(
          "Could not delete meeting",
          "error"
        );
      } finally {
        setDeletingMeeting(
          false
        );
      }
    };

  const handleCreatedMeeting =
    (
      createdMeeting: MeetingDetail
    ) => {
      setShowCreateMeeting(
        false
      );

      setMeetings(
        (current) =>
          [
            createdMeeting,
            ...current,
          ].sort(
            (a, b) =>
              new Date(
                b.meeting_date
              ).getTime() -
              new Date(
                a.meeting_date
              ).getTime()
          )
      );

      showToast(
        "Meeting created"
      );
    };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#121212] text-[#ededed]">
      <Sidebar />
      <Topbar />

      <main className="ml-[60px] pt-[72px]">
        <div className="mx-auto w-full max-w-[1280px] px-8 pb-16 pt-9">
          {/* Page heading */}
          <div className="flex items-start justify-between gap-5">
            <div>
              <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-white">
                Meetings
              </h1>

              <p className="mt-1.5 text-[14px] text-[#8f8f8f]">
                Review your
                meeting notes,
                transcripts and
                action items.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowCreateMeeting(
                  true
                )
              }
              className="flex h-10 items-center gap-2 rounded-md bg-[#6d32e9] px-4 text-sm font-medium text-white transition-colors hover:bg-[#7b42ef]"
            >
              <Plus size={16} />
              New Meeting
            </button>
          </div>

          {/* Filters */}
          <div className="mt-9 flex items-center gap-3">
            {/* Search */}
            <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-[#343434] bg-[#181818] px-3">
              <Search
                size={17}
                className="shrink-0 text-[#777]"
              />

              <input
                type="text"
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search meetings"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#777]"
              />
            </div>

            {/* Participant */}
            <div className="flex h-11 w-[195px] items-center gap-2 rounded-md border border-[#343434] bg-[#181818] px-3">
              <UserRound
                size={16}
                className="shrink-0 text-[#777]"
              />

              <input
                type="text"
                value={
                  participant
                }
                onChange={(
                  event
                ) =>
                  setParticipant(
                    event.target
                      .value
                  )
                }
                placeholder="Participant"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#777]"
              />
            </div>

            {/* Date */}
            <div className="flex h-11 w-[205px] items-center gap-2 rounded-md border border-[#343434] bg-[#181818] px-3">
              <CalendarDays
                size={16}
                className="shrink-0 text-[#777]"
              />

              <input
                type="date"
                value={
                  meetingDate
                }
                onChange={(
                  event
                ) =>
                  setMeetingDate(
                    event.target
                      .value
                  )
                }
                aria-label="Meeting date"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#ccc] outline-none"
              />
            </div>
          </div>

          {/* Meeting list heading */}
          <div className="mt-9 flex items-center justify-between border-b border-[#292929] pb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-medium text-white">
                My Meetings
              </h2>

              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#292929] px-1.5 text-[11px] text-[#aaa]">
                {
                  filteredMeetings.length
                }
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setSortOrder(
                  (current) =>
                    current ===
                    "recent"
                      ? "oldest"
                      : "recent"
                )
              }
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[#aaa] hover:bg-[#202020] hover:text-white"
            >
              {sortOrder ===
              "recent"
                ? "Most recent"
                : "Oldest first"}

              <ChevronDown
                size={15}
              />
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <MeetingListLoading />
          )}

          {/* Error */}
          {!loading &&
            error && (
              <div className="py-20 text-center">
                <p className="text-sm text-red-400">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="mt-4 rounded-md bg-[#292929] px-4 py-2 text-sm text-white hover:bg-[#343434]"
                >
                  Try again
                </button>
              </div>
            )}

          {/* Empty */}
          {!loading &&
            !error &&
            filteredMeetings.length ===
              0 && (
              <MeetingEmptyState
                hasFilters={
                  Boolean(
                    search ||
                      participant ||
                      meetingDate
                  )
                }
                onClear={() => {
                  setSearch("");
                  setParticipant(
                    ""
                  );
                  setMeetingDate(
                    ""
                  );
                }}
                onCreate={() =>
                  setShowCreateMeeting(
                    true
                  )
                }
              />
            )}

          {/* Meetings */}
          {!loading &&
            !error &&
            filteredMeetings.length >
              0 && (
              <div>
                {filteredMeetings.map(
                  (meeting) => (
                    <MeetingRow
                      key={
                        meeting.id
                      }
                      meeting={
                        meeting
                      }
                      onOpen={() =>
                        router.push(
                          `/meetings/${meeting.id}`
                        )
                      }
                      onRename={() =>
                        setMeetingToRename(
                          meeting
                        )
                      }
                      onDelete={() =>
                        setMeetingToDelete(
                          meeting
                        )
                      }
                    />
                  )
                )}
              </div>
            )}
        </div>
      </main>

      {/* Help */}
      <button
        type="button"
        aria-label="Help"
        className="fixed bottom-7 right-7 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-[#d9ceff] text-xl text-[#29234a] shadow-xl transition-transform hover:scale-105"
      >
        ?
      </button>

      {/* Create */}
      {showCreateMeeting && (
        <CreateMeetingModal
          onClose={() =>
            setShowCreateMeeting(
              false
            )
          }
          onCreated={
            handleCreatedMeeting
          }
        />
      )}

      {/* Rename */}
      {meetingToRename && (
        <RenameMeetingModal
          currentTitle={
            meetingToRename.title
          }
          onClose={() =>
            setMeetingToRename(
              null
            )
          }
          onRename={
            handleRenameMeeting
          }
        />
      )}

      {/* Delete */}
      {meetingToDelete && (
        <DeleteMeetingModal
          title={
            meetingToDelete.title
          }
          deleting={
            deletingMeeting
          }
          onClose={() => {
            if (
              !deletingMeeting
            ) {
              setMeetingToDelete(
                null
              );
            }
          }}
          onDelete={
            handleDeleteMeeting
          }
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={
            toast.message
          }
          type={toast.type}
          onClose={() =>
            setToast(null)
          }
        />
      )}
    </div>
  );
}

// ============================================================
// Meeting row
// ============================================================

function MeetingRow({
  meeting,
  onOpen,
  onRename,
  onDelete,
}: {
  meeting: Meeting;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (
          event.key ===
            "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onOpen();
        }
      }}
      className="group flex w-full cursor-pointer items-center border-b border-[#252525] px-3 py-5 text-left transition-colors hover:bg-[#191919]"
    >
      <ParticipantAvatars
        meeting={meeting}
      />

      <div className="ml-4 min-w-0 flex-1">
        <div className="truncate text-[15px] font-medium text-[#ededed]">
          {meeting.title}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#898989]">
          <span>
            {formatMeetingDate(
              meeting.meeting_date
            )}
          </span>

          <span>•</span>

          <span>
            {formatDuration(
              meeting.duration_seconds
            )}
          </span>

          <span>•</span>

          <span className="truncate">
            {formatParticipantNames(
              meeting
            )}
          </span>
        </div>
      </div>

      <MeetingActions
        title={meeting.title}
        onRename={onRename}
        onDelete={onDelete}
      />
    </div>
  );
}

// ============================================================
// Participant avatars
// ============================================================

function ParticipantAvatars({
  meeting,
}: {
  meeting: Meeting;
}) {
  const visible =
    meeting.participants.slice(
      0,
      3
    );

  if (visible.length === 0) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#343434] text-xs text-[#999]">
        ?
      </div>
    );
  }

  return (
    <div className="flex w-[98px] shrink-0 items-center pl-1">
      {visible.map(
        (
          participant,
          index
        ) => (
          <div
            key={
              participant.id
            }
            title={
              participant.name
            }
            className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#121212] text-[10px] font-semibold text-white"
            style={{
              marginLeft:
                index === 0
                  ? 0
                  : -8,

              zIndex:
                visible.length -
                index,

              backgroundColor:
                participant.avatar_color ||
                "#555555",
            }}
          >
            {getInitials(
              participant.name
            )}
          </div>
        )
      )}
    </div>
  );
}

// ============================================================
// Loading state
// ============================================================

function MeetingListLoading() {
  return (
    <div className="py-4">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center border-b border-[#252525] px-3 py-5"
        >
          <div className="h-9 w-[90px] rounded-full bg-[#202020]" />

          <div className="ml-4 flex-1">
            <div className="h-4 w-[220px] rounded bg-[#242424]" />

            <div className="mt-2 h-3 w-[360px] max-w-full rounded bg-[#202020]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Empty state
// ============================================================

function MeetingEmptyState({
  hasFilters,
  onClear,
  onCreate,
}: {
  hasFilters: boolean;
  onClear: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#211c2e] text-[#a98cff]">
        <SlidersHorizontal
          size={20}
        />
      </div>

      <h3 className="mt-4 text-[16px] font-medium text-white">
        {hasFilters
          ? "No meetings found"
          : "No meetings yet"}
      </h3>

      <p className="mt-2 max-w-[390px] text-sm leading-6 text-[#777]">
        {hasFilters
          ? "Try changing or clearing your meeting filters."
          : "Create your first meeting by adding meeting details and a transcript."}
      </p>

      {hasFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-md border border-[#3a3a3a] bg-[#202020] px-4 py-2 text-sm text-[#ddd] hover:bg-[#292929]"
        >
          Clear filters
        </button>
      ) : (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 flex items-center gap-2 rounded-md bg-[#6d32e9] px-4 py-2 text-sm font-medium text-white hover:bg-[#7b42ef]"
        >
          <Plus size={15} />
          New Meeting
        </button>
      )}
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function getInitials(
  name: string
) {
  return name
    .split(" ")
    .filter(Boolean)
    .map(
      (part) =>
        part[0]
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatMeetingDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
}

function formatDuration(
  seconds: number
) {
  const totalSeconds =
    Math.max(
      0,
      Math.floor(seconds)
    );

  const hours =
    Math.floor(
      totalSeconds / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) /
        60
    );

  const remainingSeconds =
    totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

function formatParticipantNames(
  meeting: Meeting
) {
  if (
    meeting.participants.length ===
    0
  ) {
    return "No participants";
  }

  const visible =
    meeting.participants
      .slice(0, 2)
      .map(
        (participant) =>
          participant.name
      );

  const remaining =
    meeting.participants.length -
    visible.length;

  return remaining > 0
    ? `${visible.join(", ")} +${remaining}`
    : visible.join(", ");
}

function getDateInputValue(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}