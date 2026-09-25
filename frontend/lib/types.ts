export type Participant = {
  id: number;
  name: string;
  email: string | null;
  avatar_color: string | null;
};

export type Meeting = {
  id: number;
  title: string;
  meeting_date: string;
  duration_seconds: number;
  participants: Participant[];
};

export type TranscriptSegment = {
  id: number;
  start_time: number;
  end_time: number;
  text: string;
  sequence_number: number;
  speaker: Participant | null;
};

export type MeetingSummary = {
  id: number;
  overview: string;
};

export type ActionItem = {
  id: number;
  text: string;
  is_completed: boolean;
  assignee: Participant | null;
};

export type Chapter = {
  id: number;
  title: string;
  start_time: number;
  summary: string | null;
  sequence_number: number;
};

export type MeetingDetail = Meeting & {
  transcript_segments: TranscriptSegment[];
  summary: MeetingSummary | null;
  action_items: ActionItem[];
  chapters: Chapter[];
};