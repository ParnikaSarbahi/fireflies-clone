"use client";

import { AlertTriangle, X } from "lucide-react";

type DeleteMeetingModalProps = {
  title: string;
  deleting?: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
};

export default function DeleteMeetingModal({
  title,
  deleting = false,
  onClose,
  onDelete,
}: DeleteMeetingModalProps) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-5 backdrop-blur-[2px]">
      <div className="w-full max-w-[440px] rounded-xl border border-[#343434] bg-[#1b1b1b] shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-950/60 text-red-400">
            <AlertTriangle size={19} />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#888] hover:bg-[#292929] hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-5 pb-5 pt-4">
          <h2 className="text-[17px] font-semibold text-white">
            Delete meeting?
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#999]">
            <span className="text-[#ddd]">{title}</span> and its
            transcript, notes and action items will be permanently deleted.
          </p>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md px-4 text-sm text-[#aaa] hover:bg-[#292929] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="h-9 rounded-md bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}