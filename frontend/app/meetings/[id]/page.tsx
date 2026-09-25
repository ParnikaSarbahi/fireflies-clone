"use client";

import {
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  Download,
  Edit3,
  FileText,
  ListChecks,
  MoreHorizontal,
  Pause,
  Play,
  Search,
  Share2,
  Sparkles,
} from "lucide-react";

import { getMeeting } from "../../../lib/api";
import type {
  ActionItem,
  Chapter,
  MeetingDetail,
  TranscriptSegment,
} from "../../../lib/types";

type MeetingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function MeetingPage({
  params,
}: MeetingPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [meeting, setMeeting] =
    useState<MeetingDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [transcriptSearch, setTranscriptSearch] =
    useState("");

  // Player state
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Used to keep our simulated player synced with real elapsed time.
  const playbackStartRef = useRef<number | null>(null);
  const playbackOffsetRef = useRef(0);

  // Used for scrolling the active transcript line into view.
  const transcriptRefs = useRef<
    Record<number, HTMLDivElement | null>
  >({});

  // ----------------------------
  // Load meeting
  // ----------------------------

  useEffect(() => {
    const meetingId = Number(id);

    if (Number.isNaN(meetingId)) {
      setError("Invalid meeting.");
      setLoading(false);
      return;
    }

    const loadMeeting = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMeeting(meetingId);

        setMeeting(data);
        setCurrentTime(0);
        setIsPlaying(false);
      } catch (err) {
        console.error(
          "Failed to load meeting:",
          err
        );

        setError(
          "Unable to load this meeting."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();
  }, [id]);

  // ----------------------------
  // Simulated player
  // ----------------------------

  useEffect(() => {
    if (!isPlaying || !meeting) {
      return;
    }

    playbackStartRef.current =
      performance.now();

    playbackOffsetRef.current =
      currentTime;

    let animationFrameId: number;

    const updatePlayback = (
      now: number
    ) => {
      if (
        playbackStartRef.current ===
        null
      ) {
        return;
      }

      const elapsedSeconds =
        (now -
          playbackStartRef.current) /
        1000;

      const nextTime =
        playbackOffsetRef.current +
        elapsedSeconds;

      if (
        nextTime >=
        meeting.duration_seconds
      ) {
        setCurrentTime(
          meeting.duration_seconds
        );

        setIsPlaying(false);

        playbackStartRef.current =
          null;

        return;
      }

      setCurrentTime(nextTime);

      animationFrameId =
        requestAnimationFrame(
          updatePlayback
        );
    };

    animationFrameId =
      requestAnimationFrame(
        updatePlayback
      );

    return () => {
      cancelAnimationFrame(
        animationFrameId
      );
    };
  }, [isPlaying, meeting]);

  // ----------------------------
  // Derived transcript state
  // ----------------------------

  const activeSegment =
    meeting?.transcript_segments.find(
      (segment) =>
        currentTime >=
          segment.start_time &&
        currentTime <
          segment.end_time
    ) ?? null;

  // Auto-scroll active transcript
  useEffect(() => {
    if (!activeSegment) {
      return;
    }

    const element =
      transcriptRefs.current[
        activeSegment.id
      ];

    element?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeSegment?.id]);

  if (loading) {
    return <MeetingLoading />;
  }

  if (error || !meeting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] text-white">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            Meeting unavailable
          </h1>

          <p className="mt-2 text-sm text-[#888]">
            {error ||
              "The meeting could not be found."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/meetings")
            }
            className="mt-5 rounded-md bg-[#6d32e9] px-4 py-2 text-sm font-medium text-white"
          >
            Back to meetings
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------
  // Search
  // ----------------------------

  const searchTerm =
    transcriptSearch
      .trim()
      .toLowerCase();

  const filteredTranscript =
    searchTerm.length === 0
      ? meeting.transcript_segments
      : meeting.transcript_segments.filter(
          (segment) =>
            segment.text
              .toLowerCase()
              .includes(searchTerm)
        );

  // ----------------------------
  // Player helpers
  // ----------------------------

  const seekTo = (seconds: number) => {
    const safeTime = Math.min(
      Math.max(seconds, 0),
      meeting.duration_seconds
    );

    setCurrentTime(safeTime);

    playbackOffsetRef.current =
      safeTime;

    playbackStartRef.current =
      performance.now();
  };

  const togglePlayback = () => {
    if (
      currentTime >=
      meeting.duration_seconds
    ) {
      setCurrentTime(0);

      playbackOffsetRef.current = 0;
    }

    setIsPlaying(
      (previous) => !previous
    );
  };

  const handleSeek = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    seekTo(
      Number(event.target.value)
    );
  };

  const progress =
    meeting.duration_seconds > 0
      ? (currentTime /
          meeting.duration_seconds) *
        100
      : 0;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#121212] text-[#ededed]">
      {/* Meeting Header */}
      <header className="flex h-[72px] shrink-0 items-center border-b border-[#292929] bg-[#171717] px-5">
        <button
          type="button"
          onClick={() =>
            router.push("/meetings")
          }
          aria-label="Back to meetings"
          className="mr-3 flex h-9 w-9 items-center justify-center rounded-md text-[#aaa] transition-colors hover:bg-[#292929] hover:text-white"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-600 font-bold text-white">
            F
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="max-w-[430px] truncate text-[16px] font-semibold">
                {meeting.title}
              </h1>

              <button
                type="button"
                aria-label="Edit meeting title"
                className="text-[#777] hover:text-white"
              >
                <Edit3 size={14} />
              </button>
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs text-[#888]">
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
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="hidden h-9 items-center gap-2 rounded-md border border-[#343434] px-3 text-sm text-[#bbb] transition-colors hover:bg-[#242424] hover:text-white md:flex"
          >
            <Share2 size={15} />
            Share
          </button>

          <button
            type="button"
            aria-label="Download meeting"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#343434] text-[#aaa] hover:bg-[#242424] hover:text-white"
          >
            <Download size={16} />
          </button>

          <button
            type="button"
            aria-label="More meeting actions"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#343434] text-[#aaa] hover:bg-[#242424] hover:text-white"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </header>

      {/* Main workspace */}
      <main className="flex min-h-0 flex-1 overflow-hidden">
        {/* AI Notes */}
        <section className="flex w-[48%] min-w-0 flex-col border-r border-[#292929] bg-[#121212]">
          <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-[#292929] px-6">
            <div className="flex items-center gap-2">
              <Sparkles
                size={17}
                className="text-[#9c75ff]"
              />

              <span className="text-[14px] font-medium">
                AI Notes
              </span>
            </div>

            <button
              type="button"
              className="flex items-center gap-1 text-xs text-[#888] hover:text-white"
            >
              General
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-7 py-6">
            <NotesSection
              icon={
                <FileText size={17} />
              }
              title="Overview"
            >
              <p className="text-[14px] leading-6 text-[#c7c7c7]">
                {meeting.summary
                  ?.overview ||
                  "No meeting summary is available."}
              </p>
            </NotesSection>

            <NotesSection
              icon={
                <ListChecks size={17} />
              }
              title="Action items"
            >
              {meeting.action_items
                .length > 0 ? (
                <div className="space-y-3">
                  {meeting.action_items.map(
                    (actionItem) => (
                      <ActionItemRow
                        key={
                          actionItem.id
                        }
                        actionItem={
                          actionItem
                        }
                      />
                    )
                  )}
                </div>
              ) : (
                <EmptyText>
                  No action items were
                  identified.
                </EmptyText>
              )}
            </NotesSection>

            <NotesSection
              icon={<Clock3 size={17} />}
              title="Meeting outline"
            >
              {meeting.chapters.length >
              0 ? (
                <div className="space-y-1">
                  {meeting.chapters.map(
                    (chapter) => (
                      <ChapterRow
                        key={chapter.id}
                        chapter={chapter}
                        onSeek={seekTo}
                        active={
                          currentTime >=
                            chapter.start_time &&
                          isCurrentChapter(
                            meeting.chapters,
                            chapter,
                            currentTime
                          )
                        }
                      />
                    )
                  )}
                </div>
              ) : (
                <EmptyText>
                  No meeting chapters are
                  available.
                </EmptyText>
              )}
            </NotesSection>

            <NotesSection title="Participants">
              <div className="flex flex-wrap gap-2">
                {meeting.participants.map(
                  (participant) => (
                    <div
                      key={
                        participant.id
                      }
                      className="flex items-center gap-2 rounded-full border border-[#303030] bg-[#191919] py-1.5 pl-1.5 pr-3"
                    >
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                        style={{
                          backgroundColor:
                            participant.avatar_color ||
                            "#555555",
                        }}
                      >
                        {getInitials(
                          participant.name
                        )}
                      </div>

                      <span className="text-xs text-[#c7c7c7]">
                        {
                          participant.name
                        }
                      </span>
                    </div>
                  )
                )}
              </div>
            </NotesSection>
          </div>
        </section>

        {/* Transcript */}
        <section className="flex min-w-0 flex-1 flex-col bg-[#141414]">
          <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-[#292929] px-5">
            <div className="flex items-center gap-2">
              <FileText size={17} />

              <span className="text-[14px] font-medium">
                Transcript
              </span>

              <span className="rounded bg-[#282828] px-1.5 py-0.5 text-[10px] text-[#999]">
                {
                  meeting
                    .transcript_segments
                    .length
                }
              </span>
            </div>

            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[#999] hover:bg-[#252525] hover:text-white"
            >
              <Edit3 size={14} />
              Edit
            </button>
          </div>

          {/* Search */}
          <div className="border-b border-[#292929] p-4">
            <div className="flex h-9 items-center gap-2 rounded-md border border-[#333] bg-[#1a1a1a] px-3">
              <Search
                size={15}
                className="text-[#777]"
              />

              <input
                type="text"
                value={transcriptSearch}
                onChange={(event) =>
                  setTranscriptSearch(
                    event.target.value
                  )
                }
                placeholder="Search transcript"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#777]"
              />

              {transcriptSearch && (
                <span className="text-[11px] text-[#777]">
                  {
                    filteredTranscript.length
                  }{" "}
                  matches
                </span>
              )}
            </div>
          </div>

          {/* Transcript rows */}
          <div className="flex-1 overflow-y-auto px-5 py-3">
            {filteredTranscript.length >
            0 ? (
              filteredTranscript.map(
                (segment) => (
                  <TranscriptRow
                    key={segment.id}
                    segment={segment}
                    search={
                      transcriptSearch
                    }
                    active={
                      activeSegment?.id ===
                      segment.id
                    }
                    onSeek={seekTo}
                    elementRef={(
                      element
                    ) => {
                      transcriptRefs.current[
                        segment.id
                      ] = element;
                    }}
                  />
                )
              )
            ) : (
              <div className="py-16 text-center text-sm text-[#777]">
                No transcript matches
                found.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Player */}
      <footer className="flex h-[72px] shrink-0 items-center border-t border-[#292929] bg-[#181818] px-6">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={
            isPlaying
              ? "Pause recording"
              : "Play recording"
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6d32e9] text-white transition-colors hover:bg-[#7c45ee]"
        >
          {isPlaying ? (
            <Pause
              size={17}
              fill="currentColor"
            />
          ) : (
            <Play
              size={17}
              fill="currentColor"
              className="ml-0.5"
            />
          )}
        </button>

        <span className="ml-4 w-[52px] text-xs tabular-nums text-[#aaa]">
          {formatPlayerTime(
            currentTime
          )}
        </span>

        {/* Native range input gives us
            click + drag seeking */}
        <div className="relative mx-3 flex flex-1 items-center">
          <div className="pointer-events-none absolute left-0 right-0 h-1 overflow-hidden rounded-full bg-[#383838]">
            <div
              className="h-full bg-[#8257ee]"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <input
            type="range"
            min={0}
            max={
              meeting.duration_seconds
            }
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Meeting progress"
            className="relative z-10 h-5 w-full cursor-pointer opacity-0"
          />
        </div>

        <span className="w-[55px] text-right text-xs tabular-nums text-[#aaa]">
          {formatPlayerTime(
            meeting.duration_seconds
          )}
        </span>

        <button
          type="button"
          className="ml-4 rounded-md px-2 py-1 text-xs text-[#aaa] hover:bg-[#292929] hover:text-white"
        >
          1x
        </button>
      </footer>
    </div>
  );
}

function NotesSection({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2 text-[14px] font-medium text-[#ededed]">
        {icon && (
          <span className="text-[#999]">
            {icon}
          </span>
        )}

        {title}
      </div>

      {children}
    </section>
  );
}

function ActionItemRow({
  actionItem,
}: {
  actionItem: ActionItem;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[#2d2d2d] bg-[#181818] p-3">
      <button
        type="button"
        aria-label="Complete action item"
        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border ${
          actionItem.is_completed
            ? "border-[#7651df] bg-[#7651df] text-white"
            : "border-[#555] text-transparent"
        }`}
      >
        <Check size={12} />
      </button>

      <div className="min-w-0">
        <p
          className={`text-[13px] leading-5 ${
            actionItem.is_completed
              ? "text-[#777] line-through"
              : "text-[#cfcfcf]"
          }`}
        >
          {actionItem.text}
        </p>

        {actionItem.assignee && (
          <div className="mt-1.5 text-[11px] text-[#777]">
            {
              actionItem.assignee
                .name
            }
          </div>
        )}
      </div>
    </div>
  );
}

function ChapterRow({
  chapter,
  onSeek,
  active,
}: {
  chapter: Chapter;
  onSeek: (seconds: number) => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onSeek(chapter.start_time)
      }
      className={`flex w-full gap-4 rounded-md px-2 py-3 text-left transition-colors ${
        active
          ? "bg-[#211c2e]"
          : "hover:bg-[#1c1c1c]"
      }`}
    >
      <span
        className={`w-[42px] shrink-0 pt-0.5 text-xs font-medium ${
          active
            ? "text-[#ad91ff]"
            : "text-[#8f6fea]"
        }`}
      >
        {formatPlayerTime(
          chapter.start_time
        )}
      </span>

      <div>
        <div className="text-[13px] font-medium text-[#d7d7d7]">
          {chapter.title}
        </div>

        {chapter.summary && (
          <div className="mt-1 text-xs leading-5 text-[#777]">
            {chapter.summary}
          </div>
        )}
      </div>
    </button>
  );
}

function TranscriptRow({
  segment,
  search,
  active,
  onSeek,
  elementRef,
}: {
  segment: TranscriptSegment;
  search: string;
  active: boolean;
  onSeek: (seconds: number) => void;
  elementRef: (
    element: HTMLDivElement | null
  ) => void;
}) {
  return (
    <div
      ref={elementRef}
      role="button"
      tabIndex={0}
      onClick={() =>
        onSeek(segment.start_time)
      }
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();

          onSeek(
            segment.start_time
          );
        }
      }}
      className={`group flex cursor-pointer gap-4 rounded-lg border px-3 py-4 transition-colors ${
        active
          ? "border-[#59418c] bg-[#211b2e]"
          : "border-transparent hover:bg-[#1c1c1c]"
      }`}
    >
      <span
        className={`w-[46px] shrink-0 pt-1 text-left text-[11px] ${
          active
            ? "text-[#ad91ff]"
            : "text-[#777] group-hover:text-[#9c7bf4]"
        }`}
      >
        {formatPlayerTime(
          segment.start_time
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-semibold text-white"
            style={{
              backgroundColor:
                segment.speaker
                  ?.avatar_color ||
                "#555555",
            }}
          >
            {segment.speaker
              ? getInitials(
                  segment.speaker
                    .name
                )
              : "?"}
          </div>

          <span
            className={`text-[12px] font-medium ${
              active
                ? "text-white"
                : "text-[#bdbdbd]"
            }`}
          >
            {segment.speaker
              ?.name ||
              "Unknown speaker"}
          </span>
        </div>

        <p
          className={`text-[14px] leading-6 ${
            active
              ? "text-[#ededed]"
              : "text-[#c8c8c8]"
          }`}
        >
          <HighlightedText
            text={segment.text}
            search={search}
          />
        </p>
      </div>
    </div>
  );
}

function HighlightedText({
  text,
  search,
}: {
  text: string;
  search: string;
}) {
  const query = search.trim();

  if (!query) {
    return <>{text}</>;
  }

  const escaped =
    query.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  const regex = new RegExp(
    `(${escaped})`,
    "gi"
  );

  const parts =
    text.split(regex);

  return (
    <>
      {parts.map(
        (part, index) =>
          part.toLowerCase() ===
          query.toLowerCase() ? (
            <mark
              key={index}
              className="rounded-sm bg-[#7052c8] px-0.5 text-white"
            >
              {part}
            </mark>
          ) : (
            <span key={index}>
              {part}
            </span>
          )
      )}
    </>
  );
}

function EmptyText({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-sm text-[#777]">
      {children}
    </p>
  );
}

function MeetingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] text-[#999]">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#444] border-t-[#8c66ef]" />
        Loading meeting...
      </div>
    </div>
  );
}

function isCurrentChapter(
  chapters: Chapter[],
  chapter: Chapter,
  currentTime: number
) {
  const index =
    chapters.findIndex(
      (item) =>
        item.id === chapter.id
    );

  const nextChapter =
    chapters[index + 1];

  if (!nextChapter) {
    return (
      currentTime >=
      chapter.start_time
    );
  }

  return (
    currentTime >=
      chapter.start_time &&
    currentTime <
      nextChapter.start_time
  );
}

function getInitials(
  name: string
) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
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
  ).format(new Date(value));
}

function formatDuration(
  seconds: number
) {
  const minutes =
    Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(minutes / 60);

  const remainingMinutes =
    minutes % 60;

  return `${hours} hr ${remainingMinutes} min`;
}

function formatPlayerTime(
  seconds: number
) {
  const totalSeconds =
    Math.floor(seconds);

  const minutes =
    Math.floor(
      totalSeconds / 60
    );

  const remainingSeconds =
    totalSeconds % 60;

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}