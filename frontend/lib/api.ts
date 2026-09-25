import type {
  ActionItem,
  Meeting,
  MeetingDetail,
  TranscriptSegment,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  export async function updateTranscriptSegment(
  segmentId: number,
  text: string
): Promise<TranscriptSegment> {
  const response = await fetch(
    `${API_URL}/api/transcript-segments/${segmentId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to update transcript segment"
    );
  }

  return response.json();
}

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

export async function createActionItem(
  meetingId: number,
  data: {
    text: string;
    assignee_id?: number | null;
  }
): Promise<ActionItem> {
  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}/action-items`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create action item");
  }

  return response.json();
}


export async function updateActionItem(
  actionItemId: number,
  data: {
    text?: string;
    assignee_id?: number;
    is_completed?: boolean;
  }
): Promise<ActionItem> {
  const response = await fetch(
    `${API_URL}/api/action-items/${actionItemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update action item");
  }

  return response.json();
}


export async function deleteActionItem(
  actionItemId: number
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/action-items/${actionItemId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete action item");
  }
}

export type CreateMeetingData = {
  title: string;
  meeting_date: string;
  duration_seconds: number;
  participant_names: string[];
  transcript_text?: string;
};

export type UpdateMeetingData = {
  title?: string;
  meeting_date?: string;
  duration_seconds?: number;
  participant_names?: string[];
};

export async function createMeeting(
  data: CreateMeetingData
): Promise<MeetingDetail> {
  const response = await fetch(
    `${API_URL}/api/meetings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create meeting");
  }

  return response.json();
}

export async function updateMeeting(
  meetingId: number,
  data: UpdateMeetingData
): Promise<MeetingDetail> {
  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update meeting");
  }

  return response.json();
}

export async function deleteMeeting(
  meetingId: number
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete meeting");
  }
}