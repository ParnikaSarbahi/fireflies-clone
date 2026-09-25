"use client";

import { useState } from "react";
import { FileText, Upload, X } from "lucide-react";

import {
  createMeeting,
  type CreateMeetingData,
} from "../../lib/api";

import type { MeetingDetail } from "../../lib/types";

type CreateMeetingModalProps = {
  onClose: () => void;
  onCreated: (meeting: MeetingDetail) => void;
};

export default function CreateMeetingModal({
  onClose,
  onCreated,
}: CreateMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [participants, setParticipants] = useState("");
  const [transcript, setTranscript] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".txt")) {
      setError("Please upload a .txt transcript file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setTranscript(String(reader.result || ""));
      setError("");
    };

    reader.onerror = () => {
      setError("Could not read the transcript file.");
    };

    reader.readAsText(file);
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const cleanedTitle = title.trim();

    if (!cleanedTitle) {
      setError("Meeting title is required.");
      return;
    }

    if (!meetingDate) {
      setError("Meeting date and time are required.");
      return;
    }

    const participantNames = participants
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    const minutes = Number(durationMinutes);

    if (
      durationMinutes &&
      (Number.isNaN(minutes) || minutes < 0)
    ) {
      setError("Duration must be a valid number.");
      return;
    }

    const data: CreateMeetingData = {
      title: cleanedTitle,
      meeting_date: new Date(meetingDate).toISOString(),
      duration_seconds: durationMinutes
        ? Math.round(minutes * 60)
        : 0,
      participant_names: participantNames,
      transcript_text: transcript.trim() || undefined,
    };

    try {
      setSubmitting(true);
      setError("");

      const created = await createMeeting(data);

      onCreated(created);
    } catch (err) {
      console.error(err);
      setError("Could not create meeting.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-[2px]">
      <div className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-xl border border-[#343434] bg-[#181818] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#303030] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Create meeting
            </h2>

            <p className="mt-1 text-xs text-[#888]">
              Add meeting details and a transcript.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#888] hover:bg-[#292929] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <FormField label="Meeting title">
            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Weekly Product Sync"
              autoFocus
              className="h-10 w-full rounded-md border border-[#383838] bg-[#121212] px-3 text-sm text-white outline-none transition-colors placeholder:text-[#666] focus:border-[#7651df]"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Date & time">
              <input
                type="datetime-local"
                value={meetingDate}
                onChange={(event) =>
                  setMeetingDate(event.target.value)
                }
                className="h-10 w-full rounded-md border border-[#383838] bg-[#121212] px-3 text-sm text-[#ccc] outline-none focus:border-[#7651df]"
              />
            </FormField>

            <FormField
              label="Duration"
              hint="minutes"
            >
              <input
                type="number"
                min="0"
                step="1"
                value={durationMinutes}
                onChange={(event) =>
                  setDurationMinutes(event.target.value)
                }
                placeholder="Leave blank to derive"
                className="h-10 w-full rounded-md border border-[#383838] bg-[#121212] px-3 text-sm text-white outline-none placeholder:text-[#666] focus:border-[#7651df]"
              />
            </FormField>
          </div>

          <FormField
            label="Participants"
            hint="comma separated"
          >
            <input
              value={participants}
              onChange={(event) =>
                setParticipants(event.target.value)
              }
              placeholder="Parnika Sarbahi, Rahul Mehta"
              className="h-10 w-full rounded-md border border-[#383838] bg-[#121212] px-3 text-sm text-white outline-none placeholder:text-[#666] focus:border-[#7651df]"
            />
          </FormField>

          <FormField
            label="Transcript"
            hint="optional"
          >
            <textarea
              value={transcript}
              onChange={(event) =>
                setTranscript(event.target.value)
              }
              rows={8}
              placeholder={
                "Parnika Sarbahi: Let's start the meeting.\nRahul Mehta: The API is ready for testing."
              }
              className="w-full resize-y rounded-md border border-[#383838] bg-[#121212] p-3 text-sm leading-6 text-white outline-none placeholder:text-[#5f5f5f] focus:border-[#7651df]"
            />

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-[#777]">
                <FileText size={13} />

                Use one
                <span className="text-[#aaa]">
                  Speaker: text
                </span>
                entry per line.
              </div>

              <label className="flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-[#a98cff] hover:bg-[#211c2e]">
                <Upload size={14} />

                Upload .txt

                <input
                  type="file"
                  accept=".txt,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </FormField>

          {error && (
            <div className="rounded-md border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-[#303030] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md px-4 text-sm text-[#aaa] hover:bg-[#292929] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="h-9 rounded-md bg-[#6d32e9] px-4 text-sm font-medium text-white transition-colors hover:bg-[#7b42ef] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Creating..."
                : "Create meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#bbb]">
        <span>{label}</span>

        {hint && (
          <span className="font-normal text-[#666]">
            {hint}
          </span>
        )}
      </div>

      {children}
    </label>
  );
}