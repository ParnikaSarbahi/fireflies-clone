import type { Meeting, MeetingDetail } from "./types";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export type MeetingFilters = {
  search?: string;
  participant?: string;
  meetingDate?: string;
};

export async function getMeetings(
  filters: MeetingFilters = {}
): Promise<Meeting[]> {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.participant) {
    params.set("participant", filters.participant);
  }

  if (filters.meetingDate) {
    params.set("meeting_date", filters.meetingDate);
  }

  const query = params.toString();

  const response = await fetch(
    `${API_URL}/api/meetings${query ? `?${query}` : ""}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch meetings");
  }

  return response.json();
}
export async function getMeeting(
  meetingId: number
): Promise<MeetingDetail> {
  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Meeting not found");
    }

    throw new Error("Failed to fetch meeting");
  }

  return response.json();
}