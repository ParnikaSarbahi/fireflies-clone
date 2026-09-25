"use client";

import { useState } from "react";
import { X } from "lucide-react";

type RenameMeetingModalProps = {
  currentTitle: string;
  onClose: () => void;
  onRename: (title: string) => Promise<void>;
};

export default function RenameMeetingModal({
  currentTitle,
  onClose,
  onRename,
}: RenameMeetingModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const cleanedTitle = title.trim();

    if (!cleanedTitle) {
      setError("Meeting title cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await onRename(cleanedTitle);
    } catch {
      setError("Could not rename meeting.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-5 backdrop-blur-[2px]">
      <div className="w-full max-w-[440px] rounded-xl border border-[#343434] bg-[#1b1b1b] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#303030] px-5 py-4">
          <h2 className="text-[16px] font-semibold text-white">
            Rename meeting
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#888] hover:bg-[#292929] hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <label className="text-xs font-medium text-[#aaa]">
            Meeting title
          </label>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
            className="mt-2 h-10 w-full rounded-md border border-[#3a3a3a] bg-[#121212] px-3 text-sm text-white outline-none focus:border-[#7651df]"
          />

          {error && (
            <p className="mt-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md px-4 text-sm text-[#aaa] hover:bg-[#292929] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !title.trim() ||
                title.trim() === currentTitle
              }
              className="h-9 rounded-md bg-[#6d32e9] px-4 text-sm font-medium text-white hover:bg-[#7b42ef] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}