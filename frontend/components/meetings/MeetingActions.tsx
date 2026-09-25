"use client";

import { useEffect, useRef, useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

type MeetingActionsProps = {
  title: string;
  onRename: () => void;
  onDelete: () => void;
};

export default function MeetingActions({
  title,
  onRename,
  onDelete,
}: MeetingActionsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative ml-4 shrink-0"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label={`Actions for ${title}`}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[#777] opacity-0 transition-all hover:bg-[#303030] hover:text-white group-hover:opacity-100"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-[160px] overflow-hidden rounded-lg border border-[#343434] bg-[#202020] p-1 shadow-2xl">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onRename();
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#ddd] hover:bg-[#303030]"
          >
            <Pencil size={14} />
            Rename
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-400 hover:bg-red-950/40"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}