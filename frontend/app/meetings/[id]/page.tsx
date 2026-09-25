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
  Pencil,
  Play,
  Plus,
  Search,
  Share2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import {
  createActionItem,
  deleteActionItem,
  getMeeting,
  updateActionItem,
  updateMeeting,
  updateTranscriptSegment,
} from "../../../lib/api";

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

  // ============================================================
  // Meeting state
  // ============================================================

  const [meeting, setMeeting] =
    useState<MeetingDetail | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ============================================================
  // Transcript state
  // ============================================================

  const [
    transcriptSearch,
    setTranscriptSearch,
  ] = useState("");

  const [
    isEditingTranscript,
    setIsEditingTranscript,
  ] = useState(false);

  const [
    editedTranscript,
    setEditedTranscript,
  ] = useState<
    Record<number, string>
  >({});

  const [
    savingTranscript,
    setSavingTranscript,
  ] = useState(false);

  const [
    transcriptEditError,
    setTranscriptEditError,
  ] = useState("");

  // ============================================================
  // Player state
  // ============================================================

  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  const [
    isPlaying,
    setIsPlaying,
  ] = useState(false);

  const playbackStartRef =
    useRef<number | null>(null);

  const playbackOffsetRef =
    useRef(0);

  const transcriptRefs =
    useRef<
      Record<
        number,
        HTMLDivElement | null
      >
    >({});

  // ============================================================
  // Action item state
  // ============================================================

  const [
    newActionText,
    setNewActionText,
  ] = useState("");

  const [
    showAddAction,
    setShowAddAction,
  ] = useState(false);

  const [
    actionError,
    setActionError,
  ] = useState("");

  // ============================================================
  // Load meeting
  // ============================================================

  useEffect(() => {
    const meetingId = Number(id);

    if (
      Number.isNaN(meetingId)
    ) {
      setError(
        "Invalid meeting."
      );

      setLoading(false);

      return;
    }

    const loadMeeting =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getMeeting(
              meetingId
            );

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

  // ============================================================
  // Simulated media player
  // ============================================================

  useEffect(() => {
    if (
      !isPlaying ||
      !meeting
    ) {
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

      setCurrentTime(
        nextTime
      );

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
  }, [
    isPlaying,
    meeting,
  ]);

  // ============================================================
  // Active transcript segment
  // ============================================================

  const activeSegment =
    meeting?.transcript_segments.find(
      (segment) =>
        currentTime >=
          segment.start_time &&
        currentTime <
          segment.end_time
    ) ?? null;

  useEffect(() => {
    if (
      !activeSegment ||
      isEditingTranscript
    ) {
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
  }, [
    activeSegment?.id,
    isEditingTranscript,
  ]);

  // ============================================================
  // Loading / error
  // ============================================================

  if (loading) {
    return (
      <MeetingLoading />
    );
  }

  if (
    error ||
    !meeting
  ) {
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
              router.push(
                "/meetings"
              )
            }
            className="mt-5 rounded-md bg-[#6d32e9] px-4 py-2 text-sm font-medium text-white"
          >
            Back to meetings
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // Transcript search
  // ============================================================

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
              .includes(
                searchTerm
              )
        );

  // ============================================================
  // Player helpers
  // ============================================================

  const seekTo = (
    seconds: number
  ) => {
    const safeTime =
      Math.min(
        Math.max(
          seconds,
          0
        ),
        meeting.duration_seconds
      );

    setCurrentTime(
      safeTime
    );

    playbackOffsetRef.current =
      safeTime;

    playbackStartRef.current =
      performance.now();
  };

  const togglePlayback =
    () => {
      if (
        currentTime >=
        meeting.duration_seconds
      ) {
        setCurrentTime(0);

        playbackOffsetRef.current =
          0;
      }

      setIsPlaying(
        (previous) =>
          !previous
      );
    };

  const handleSeek = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    seekTo(
      Number(
        event.target.value
      )
    );
  };

  const progress =
    meeting.duration_seconds >
    0
      ? (currentTime /
          meeting.duration_seconds) *
        100
      : 0;

  // ============================================================
  // Meeting rename
  // ============================================================

  const handleRenameMeeting =
    async () => {
      if (!meeting) {
        return;
      }

      const newTitle =
        window.prompt(
          "Rename meeting",
          meeting.title
        );

      if (
        newTitle === null
      ) {
        return;
      }

      const cleanedTitle =
        newTitle.trim();

      if (
        !cleanedTitle ||
        cleanedTitle ===
          meeting.title
      ) {
        return;
      }

      try {
        const updated =
          await updateMeeting(
            meeting.id,
            {
              title:
                cleanedTitle,
            }
          );

        setMeeting(
          updated
        );
      } catch (err) {
        console.error(err);

        window.alert(
          "Could not rename meeting."
        );
      }
    };

  // ============================================================
  // Action item CRUD
  // ============================================================

  const handleToggleActionItem =
    async (
      actionItem: ActionItem
    ) => {
      try {
        setActionError("");

        const updated =
          await updateActionItem(
            actionItem.id,
            {
              is_completed:
                !actionItem.is_completed,
            }
          );

        setMeeting({
          ...meeting,

          action_items:
            meeting.action_items.map(
              (item) =>
                item.id ===
                updated.id
                  ? updated
                  : item
            ),
        });
      } catch (err) {
        console.error(err);

        setActionError(
          "Could not update action item."
        );
      }
    };

  const handleCreateActionItem =
    async () => {
      const text =
        newActionText.trim();

      if (!text) {
        return;
      }

      try {
        setActionError("");

        const created =
          await createActionItem(
            meeting.id,
            {
              text,
            }
          );

        setMeeting({
          ...meeting,

          action_items: [
            ...meeting.action_items,
            created,
          ],
        });

        setNewActionText(
          ""
        );

        setShowAddAction(
          false
        );
      } catch (err) {
        console.error(err);

        setActionError(
          "Could not add action item."
        );
      }
    };

  const handleEditActionItem =
    async (
      actionItem: ActionItem
    ) => {
      const newText =
        window.prompt(
          "Edit action item",
          actionItem.text
        );

      if (
        newText === null
      ) {
        return;
      }

      const cleanedText =
        newText.trim();

      if (!cleanedText) {
        return;
      }

      try {
        setActionError("");

        const updated =
          await updateActionItem(
            actionItem.id,
            {
              text:
                cleanedText,
            }
          );

        setMeeting({
          ...meeting,

          action_items:
            meeting.action_items.map(
              (item) =>
                item.id ===
                updated.id
                  ? updated
                  : item
            ),
        });
      } catch (err) {
        console.error(err);

        setActionError(
          "Could not edit action item."
        );
      }
    };

  const handleDeleteActionItem =
    async (
      actionItem: ActionItem
    ) => {
      const confirmed =
        window.confirm(
          `Delete "${actionItem.text}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionError("");

        await deleteActionItem(
          actionItem.id
        );

        setMeeting({
          ...meeting,

          action_items:
            meeting.action_items.filter(
              (item) =>
                item.id !==
                actionItem.id
            ),
        });
      } catch (err) {
        console.error(err);

        setActionError(
          "Could not delete action item."
        );
      }
    };

  // ============================================================
  // Transcript editing
  // ============================================================

  const handleStartTranscriptEdit =
    () => {
      const initialValues: Record<
        number,
        string
      > = {};

      meeting.transcript_segments.forEach(
        (segment) => {
          initialValues[
            segment.id
          ] =
            segment.text;
        }
      );

      setEditedTranscript(
        initialValues
      );

      setTranscriptEditError(
        ""
      );

      setIsEditingTranscript(
        true
      );

      // Pause playback while
      // editing transcript.
      setIsPlaying(false);
    };

  const handleCancelTranscriptEdit =
    () => {
      setEditedTranscript(
        {}
      );

      setTranscriptEditError(
        ""
      );

      setIsEditingTranscript(
        false
      );
    };

  const handleSaveTranscript =
    async () => {
      try {
        setSavingTranscript(
          true
        );

        setTranscriptEditError(
          ""
        );

        // Reject blank
        // transcript segments.
        const hasEmptySegment =
          meeting.transcript_segments.some(
            (segment) =>
              !(
                editedTranscript[
                  segment.id
                ] ??
                segment.text
              ).trim()
          );

        if (
          hasEmptySegment
        ) {
          setTranscriptEditError(
            "Transcript lines cannot be empty."
          );

          return;
        }

        // Only update segments
        // whose text changed.
        const changedSegments =
          meeting.transcript_segments.filter(
            (segment) =>
              (
                editedTranscript[
                  segment.id
                ] ??
                segment.text
              ).trim() !==
              segment.text
          );

        if (
          changedSegments.length ===
          0
        ) {
          setEditedTranscript(
            {}
          );

          setIsEditingTranscript(
            false
          );

          return;
        }

        const updatedSegments =
          await Promise.all(
            changedSegments.map(
              (segment) =>
                updateTranscriptSegment(
                  segment.id,

                  (
                    editedTranscript[
                      segment.id
                    ] ??
                    segment.text
                  ).trim()
                )
            )
          );

        const updatedMap =
          new Map(
            updatedSegments.map(
              (segment) => [
                segment.id,
                segment,
              ]
            )
          );

        setMeeting({
          ...meeting,

          transcript_segments:
            meeting.transcript_segments.map(
              (segment) =>
                updatedMap.get(
                  segment.id
                ) ??
                segment
            ),
        });

        setEditedTranscript(
          {}
        );

        setIsEditingTranscript(
          false
        );
      } catch (err) {
        console.error(err);

        setTranscriptEditError(
          "Could not save transcript changes."
        );
      } finally {
        setSavingTranscript(
          false
        );
      }
    };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#121212] text-[#ededed]">
      {/* Meeting header */}
      <header className="flex h-[72px] shrink-0 items-center border-b border-[#292929] bg-[#171717] px-5">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/meetings"
            )
          }
          aria-label="Back to meetings"
          className="mr-3 flex h-9 w-9 items-center justify-center rounded-md text-[#aaa] transition-colors hover:bg-[#292929] hover:text-white"
        >
          <ArrowLeft
            size={18}
          />
        </button>

        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-600 font-bold text-white">
            F
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="max-w-[430px] truncate text-[16px] font-semibold">
                {
                  meeting.title
                }
              </h1>

              <button
                type="button"
                onClick={
                  handleRenameMeeting
                }
                aria-label="Edit meeting title"
                className="text-[#777] hover:text-white"
              >
                <Edit3
                  size={14}
                />
              </button>
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs text-[#888]">
              <span>
                {formatMeetingDate(
                  meeting.meeting_date
                )}
              </span>

              <span>
                •
              </span>

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
            <Share2
              size={15}
            />

            Share
          </button>

          <button
            type="button"
            aria-label="Download meeting"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#343434] text-[#aaa] hover:bg-[#242424] hover:text-white"
          >
            <Download
              size={16}
            />
          </button>

          <button
            type="button"
            aria-label="More meeting actions"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#343434] text-[#aaa] hover:bg-[#242424] hover:text-white"
          >
            <MoreHorizontal
              size={18}
            />
          </button>
        </div>
      </header>

      {/* Main workspace */}
      <main className="flex min-h-0 flex-1 overflow-hidden">
        {/* ====================================================
            AI NOTES
        ==================================================== */}

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

              <ChevronDown
                size={14}
              />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-7 py-6">
            {/* Overview */}
            <NotesSection
              icon={
                <FileText
                  size={17}
                />
              }
              title="Overview"
            >
              <p className="text-[14px] leading-6 text-[#c7c7c7]">
                {meeting.summary
                  ?.overview ||
                  "No meeting summary is available."}
              </p>
            </NotesSection>

            {/* Action Items */}
            <NotesSection
              icon={
                <ListChecks
                  size={17}
                />
              }
              title="Action items"
            >
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowAddAction(
                      (
                        previous
                      ) =>
                        !previous
                    )
                  }
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-[#a98cff] transition-colors hover:bg-[#211c2e]"
                >
                  <Plus
                    size={14}
                  />

                  Add action item
                </button>
              </div>

              {showAddAction && (
                <div className="mb-3 rounded-lg border border-[#393939] bg-[#181818] p-3">
                  <textarea
                    value={
                      newActionText
                    }
                    onChange={(
                      event
                    ) =>
                      setNewActionText(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Add an action item..."
                    rows={2}
                    autoFocus
                    className="w-full resize-none bg-transparent text-[13px] leading-5 text-white outline-none placeholder:text-[#666]"
                  />

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddAction(
                          false
                        );

                        setNewActionText(
                          ""
                        );
                      }}
                      className="flex h-8 items-center gap-1 rounded-md px-3 text-xs text-[#999] hover:bg-[#292929] hover:text-white"
                    >
                      <X
                        size={
                          13
                        }
                      />

                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleCreateActionItem
                      }
                      disabled={
                        !newActionText.trim()
                      }
                      className="h-8 rounded-md bg-[#6d32e9] px-3 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {actionError && (
                <p className="mb-3 text-xs text-red-400">
                  {
                    actionError
                  }
                </p>
              )}

              {meeting
                .action_items
                .length >
              0 ? (
                <div className="space-y-3">
                  {meeting.action_items.map(
                    (
                      actionItem
                    ) => (
                      <ActionItemRow
                        key={
                          actionItem.id
                        }
                        actionItem={
                          actionItem
                        }
                        onToggle={
                          handleToggleActionItem
                        }
                        onEdit={
                          handleEditActionItem
                        }
                        onDelete={
                          handleDeleteActionItem
                        }
                      />
                    )
                  )}
                </div>
              ) : (
                <EmptyText>
                  No action items
                  were identified.
                </EmptyText>
              )}
            </NotesSection>

            {/* Meeting Outline */}
            <NotesSection
              icon={
                <Clock3
                  size={17}
                />
              }
              title="Meeting outline"
            >
              {meeting.chapters
                .length >
              0 ? (
                <div className="space-y-1">
                  {meeting.chapters.map(
                    (
                      chapter
                    ) => (
                      <ChapterRow
                        key={
                          chapter.id
                        }
                        chapter={
                          chapter
                        }
                        onSeek={
                          seekTo
                        }
                        active={isCurrentChapter(
                          meeting.chapters,
                          chapter,
                          currentTime
                        )}
                      />
                    )
                  )}
                </div>
              ) : (
                <EmptyText>
                  No meeting
                  chapters are
                  available.
                </EmptyText>
              )}
            </NotesSection>

            {/* Participants */}
            <NotesSection title="Participants">
              <div className="flex flex-wrap gap-2">
                {meeting.participants.map(
                  (
                    participant
                  ) => (
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

        {/* ====================================================
            TRANSCRIPT
        ==================================================== */}

        <section className="flex min-w-0 flex-1 flex-col bg-[#141414]">
          {/* Transcript Header */}
          <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-[#292929] px-5">
            <div className="flex items-center gap-2">
              <FileText
                size={17}
              />

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

            {/* Edit / Save controls */}
            <div className="flex items-center gap-2">
              {isEditingTranscript ? (
                <>
                  <button
                    type="button"
                    onClick={
                      handleCancelTranscriptEdit
                    }
                    disabled={
                      savingTranscript
                    }
                    className="rounded-md px-3 py-1.5 text-xs text-[#999] hover:bg-[#252525] hover:text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleSaveTranscript
                    }
                    disabled={
                      savingTranscript
                    }
                    className="rounded-md bg-[#6d32e9] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#7b42ef] disabled:opacity-50"
                  >
                    {savingTranscript
                      ? "Saving..."
                      : "Save"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={
                    handleStartTranscriptEdit
                  }
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[#999] hover:bg-[#252525] hover:text-white"
                >
                  <Edit3
                    size={14}
                  />

                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Transcript Search */}
          <div className="border-b border-[#292929] p-4">
            <div className="flex h-9 items-center gap-2 rounded-md border border-[#333] bg-[#1a1a1a] px-3">
              <Search
                size={15}
                className="text-[#777]"
              />

              <input
                type="text"
                value={
                  transcriptSearch
                }
                onChange={(
                  event
                ) =>
                  setTranscriptSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search transcript"
                disabled={
                  isEditingTranscript
                }
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#777] disabled:opacity-50"
              />

              {transcriptSearch &&
                !isEditingTranscript && (
                  <span className="text-[11px] text-[#777]">
                    {
                      filteredTranscript.length
                    }{" "}
                    matches
                  </span>
                )}
            </div>
          </div>

          {transcriptEditError && (
            <div className="border-b border-[#292929] px-5 py-2 text-xs text-red-400">
              {
                transcriptEditError
              }
            </div>
          )}

          {/* Transcript Rows */}
          <div className="flex-1 overflow-y-auto px-5 py-3">
            {filteredTranscript.length >
            0 ? (
              filteredTranscript.map(
                (
                  segment
                ) => (
                  <TranscriptRow
                    key={
                      segment.id
                    }
                    segment={
                      segment
                    }
                    search={
                      transcriptSearch
                    }
                    active={
                      activeSegment?.id ===
                      segment.id
                    }
                    onSeek={
                      seekTo
                    }
                    editing={
                      isEditingTranscript
                    }
                    editedText={
                      editedTranscript[
                        segment.id
                      ] ??
                      segment.text
                    }
                    onTextChange={(
                      text
                    ) =>
                      setEditedTranscript(
                        (
                          current
                        ) => ({
                          ...current,

                          [segment.id]:
                            text,
                        })
                      )
                    }
                    elementRef={(
                      element
                    ) => {
                      transcriptRefs.current[
                        segment.id
                      ] =
                        element;
                    }}
                  />
                )
              )
            ) : (
              <div className="py-16 text-center text-sm text-[#777]">
                No transcript
                matches found.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ======================================================
          PLAYER
      ====================================================== */}

      <footer className="flex h-[72px] shrink-0 items-center border-t border-[#292929] bg-[#181818] px-6">
        <button
          type="button"
          onClick={
            togglePlayback
          }
          disabled={
            isEditingTranscript
          }
          aria-label={
            isPlaying
              ? "Pause recording"
              : "Play recording"
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6d32e9] text-white transition-colors hover:bg-[#7c45ee] disabled:cursor-not-allowed disabled:opacity-50"
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
            value={
              currentTime
            }
            onChange={
              handleSeek
            }
            disabled={
              isEditingTranscript
            }
            aria-label="Meeting progress"
            className="relative z-10 h-5 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
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

// ============================================================
// Notes Section
// ============================================================

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

// ============================================================
// Action Item
// ============================================================

function ActionItemRow({
  actionItem,
  onToggle,
  onEdit,
  onDelete,
}: {
  actionItem: ActionItem;

  onToggle: (
    actionItem: ActionItem
  ) => void;

  onEdit: (
    actionItem: ActionItem
  ) => void;

  onDelete: (
    actionItem: ActionItem
  ) => void;
}) {
  return (
    <div className="group flex items-start gap-3 rounded-lg border border-[#2d2d2d] bg-[#181818] p-3">
      <button
        type="button"
        onClick={() =>
          onToggle(
            actionItem
          )
        }
        aria-label={
          actionItem.is_completed
            ? "Mark action item incomplete"
            : "Mark action item complete"
        }
        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border transition-colors ${
          actionItem.is_completed
            ? "border-[#7651df] bg-[#7651df] text-white"
            : "border-[#555] text-transparent hover:border-[#8b6de0]"
        }`}
      >
        <Check
          size={12}
        />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`text-[13px] leading-5 ${
            actionItem.is_completed
              ? "text-[#777] line-through"
              : "text-[#cfcfcf]"
          }`}
        >
          {
            actionItem.text
          }
        </p>

        {actionItem.assignee && (
          <div className="mt-1.5 text-[11px] text-[#777]">
            {
              actionItem
                .assignee.name
            }
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() =>
            onEdit(
              actionItem
            )
          }
          aria-label="Edit action item"
          className="flex h-7 w-7 items-center justify-center rounded text-[#777] hover:bg-[#292929] hover:text-white"
        >
          <Pencil
            size={13}
          />
        </button>

        <button
          type="button"
          onClick={() =>
            onDelete(
              actionItem
            )
          }
          aria-label="Delete action item"
          className="flex h-7 w-7 items-center justify-center rounded text-[#777] hover:bg-[#382020] hover:text-red-400"
        >
          <Trash2
            size={13}
          />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Chapter
// ============================================================

function ChapterRow({
  chapter,
  onSeek,
  active,
}: {
  chapter: Chapter;

  onSeek: (
    seconds: number
  ) => void;

  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onSeek(
          chapter.start_time
        )
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
          {
            chapter.title
          }
        </div>

        {chapter.summary && (
          <div className="mt-1 text-xs leading-5 text-[#777]">
            {
              chapter.summary
            }
          </div>
        )}
      </div>
    </button>
  );
}

// ============================================================
// Transcript Row
// ============================================================

function TranscriptRow({
  segment,
  search,
  active,
  onSeek,
  editing,
  editedText,
  onTextChange,
  elementRef,
}: {
  segment: TranscriptSegment;

  search: string;

  active: boolean;

  onSeek: (
    seconds: number
  ) => void;

  editing: boolean;

  editedText: string;

  onTextChange: (
    text: string
  ) => void;

  elementRef: (
    element:
      HTMLDivElement | null
  ) => void;
}) {
  return (
    <div
      ref={
        elementRef
      }
      role={
        editing
          ? undefined
          : "button"
      }
      tabIndex={
        editing
          ? undefined
          : 0
      }
      onClick={() => {
        if (!editing) {
          onSeek(
            segment.start_time
          );
        }
      }}
      onKeyDown={(
        event
      ) => {
        if (
          !editing &&
          (event.key ===
            "Enter" ||
            event.key ===
              " ")
        ) {
          event.preventDefault();

          onSeek(
            segment.start_time
          );
        }
      }}
      className={`group flex gap-4 rounded-lg border px-3 py-4 transition-colors ${
        editing
          ? "border-[#323232] bg-[#171717]"
          : active
            ? "cursor-pointer border-[#59418c] bg-[#211b2e]"
            : "cursor-pointer border-transparent hover:bg-[#1c1c1c]"
      }`}
    >
      <span
        className={`w-[46px] shrink-0 pt-1 text-left text-[11px] ${
          active &&
          !editing
            ? "text-[#ad91ff]"
            : "text-[#777]"
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
                segment
                  .speaker
                  ?.avatar_color ||
                "#555555",
            }}
          >
            {segment.speaker
              ? getInitials(
                  segment
                    .speaker
                    .name
                )
              : "?"}
          </div>

          <span
            className={`text-[12px] font-medium ${
              active &&
              !editing
                ? "text-white"
                : "text-[#bdbdbd]"
            }`}
          >
            {segment
              .speaker
              ?.name ||
              "Unknown speaker"}
          </span>
        </div>

        {editing ? (
          <textarea
            value={
              editedText
            }
            onChange={(
              event
            ) =>
              onTextChange(
                event.target
                  .value
              )
            }
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            rows={3}
            className="w-full resize-y rounded-md border border-[#3a3a3a] bg-[#181818] p-2.5 text-[14px] leading-6 text-white outline-none focus:border-[#7651df]"
          />
        ) : (
          <p
            className={`text-[14px] leading-6 ${
              active
                ? "text-[#ededed]"
                : "text-[#c8c8c8]"
            }`}
          >
            <HighlightedText
              text={
                segment.text
              }
              search={
                search
              }
            />
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Search Highlight
// ============================================================

function HighlightedText({
  text,
  search,
}: {
  text: string;
  search: string;
}) {
  const query =
    search.trim();

  if (!query) {
    return (
      <>{text}</>
    );
  }

  const escaped =
    query.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  const regex =
    new RegExp(
      `(${escaped})`,
      "gi"
    );

  const parts =
    text.split(regex);

  return (
    <>
      {parts.map(
        (
          part,
          index
        ) =>
          part.toLowerCase() ===
          query.toLowerCase() ? (
            <mark
              key={
                index
              }
              className="rounded-sm bg-[#7052c8] px-0.5 text-white"
            >
              {
                part
              }
            </mark>
          ) : (
            <span
              key={
                index
              }
            >
              {
                part
              }
            </span>
          )
      )}
    </>
  );
}

// ============================================================
// Empty State
// ============================================================

function EmptyText({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <p className="text-sm text-[#777]">
      {children}
    </p>
  );
}

// ============================================================
// Loading
// ============================================================

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

// ============================================================
// Helpers
// ============================================================

function isCurrentChapter(
  chapters: Chapter[],
  chapter: Chapter,
  currentTime: number
) {
  const index =
    chapters.findIndex(
      (item) =>
        item.id ===
        chapter.id
    );

  const nextChapter =
    chapters[
      index + 1
    ];

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
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
      hour:
        "numeric",
      minute:
        "2-digit",
    }
  ).format(
    new Date(value)
  );
}

function formatDuration(
  seconds: number
) {
  const minutes =
    Math.floor(
      seconds / 60
    );

  if (
    minutes < 60
  ) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  const remainingMinutes =
    minutes % 60;

  return `${hours} hr ${remainingMinutes} min`;
}

function formatPlayerTime(
  seconds: number
) {
  const totalSeconds =
    Math.floor(
      seconds
    );

  const minutes =
    Math.floor(
      totalSeconds /
        60
    );

  const remainingSeconds =
    totalSeconds % 60;

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(
      2,
      "0"
    )}`;
}