"use client";

import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Search,
  Video,
} from "lucide-react";

export default function Topbar() {
  const pathname = usePathname();

  const pageTitle = pathname.startsWith("/meetings")
    ? "Meetings"
    : "Home";

  return (
    <header className="fixed left-[60px] right-0 top-0 z-30 flex h-[72px] items-center border-b border-[#292929] bg-[#171717] px-5">
      
      {/* Current page title */}
      <div className="w-[170px] text-[15px] font-medium text-[#f2f2f2]">
        {pageTitle}
      </div>

      {/* Global search */}
      <div className="flex flex-1 justify-start">
        <div className="flex h-10 w-full max-w-[355px] items-center gap-2 rounded-md border border-[#353535] bg-[#1c1c1c] px-3 text-[#8f8f8f]">
          <Search size={17} />

          <input
            type="text"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#8f8f8f]"
            placeholder="Search by title or keyword"
          />

          <span className="whitespace-nowrap text-xs text-[#8b8b8b]">
            Ctrl + K
          </span>
        </div>
      </div>

      {/* Right-side controls */}
      <div className="ml-auto flex items-center gap-4">
        
        {/* Free meetings */}
        <div className="hidden items-center gap-2 text-sm text-[#b8b8b8] lg:flex">
          <span className="flex h-5 min-w-5 items-center justify-center rounded bg-emerald-700 px-1 text-[11px] text-white">
            3
          </span>

          <span>Free meetings</span>
        </div>

        {/* Upgrade */}
        <button
          type="button"
          className="hidden rounded-md border border-emerald-900 bg-emerald-950/60 px-3 py-2 text-sm text-emerald-500 transition-colors hover:bg-emerald-950 lg:block"
        >
          Upgrade
        </button>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-md text-[#a8a8a8] transition-colors hover:bg-[#242424] hover:text-white"
        >
          <Bell size={19} />
        </button>

        {/* Capture */}
        <button
          type="button"
          className="flex h-10 items-center overflow-hidden rounded-md bg-[#6d32e9] text-sm font-medium text-white transition-colors hover:bg-[#7b3ff0]"
        >
          <span className="flex h-full items-center gap-2 px-4">
            <Video size={17} />
            Capture
          </span>

          <span className="flex h-full items-center border-l border-white/20 px-2">
            <ChevronDown size={16} />
          </span>
        </button>
      </div>
    </header>
  );
}