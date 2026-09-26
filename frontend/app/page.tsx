"use client";

import {
  CalendarDays,
  ChevronRight,
  Upload,
  Video,
} from "lucide-react";
import { useState } from "react";
import ComingSoonModal from "../components/ui/ComingSoonModal";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import Logo from "../components/ui/Logo";

export default function HomePage() {
  const [comingSoonFeature, setComingSoonFeature] =
  useState<string | null>(null);
  return (
    
    <div className="min-h-screen bg-[#121212] text-[#ededed]">
      <Sidebar />
      <Topbar />

      <main className="ml-[60px] pt-[72px]">
        <div className="mx-auto max-w-[940px] px-8 py-8">
          {/* Welcome banner */}
          <section className="flex min-h-[210px] items-center justify-between rounded-[22px] border border-[#6b351d] bg-[#42200f] px-16">
            <div>
              <h1 className="text-[23px] font-semibold tracking-tight">
                Welcome Aboard!
              </h1>

              <p className="mt-3 max-w-[390px] text-[16px] leading-6 text-[#c8b8af]">
                Fireflies is ready to automate your meetings and streamline
                your workflows.
              </p>
            </div>

            <div className="hidden h-[145px] w-[220px] items-center justify-center rounded-2xl border-[4px] border-[#f1c3a5] bg-gradient-to-br from-violet-800 via-purple-700 to-indigo-950 shadow-xl md:flex">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-400">
                <Video size={25} fill="white" />
              </div>
            </div>
          </section>

          {/* Quick Start */}
          <section className="mt-14">
            <h2 className="text-[21px] font-semibold">
              Quick Start
            </h2>

            <p className="mt-1 text-[15px] text-[#a8a8a8]">
              Capture your first meeting or upload a recording to see
              Fireflies in action.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <QuickAction
                icon={<CalendarDays size={19} />}
                title="Schedule Meeting"
                className="border-[#65233c] bg-[#481326]"
                onClick={() =>
                  setComingSoonFeature("Schedule Meeting")
                }
              />

              <QuickAction
                icon={<Upload size={19} />}
                title="Upload File"
                className="border-[#164f45] bg-[#073a31]"
                onClick={() =>
                  setComingSoonFeature("Upload File")
                }
              />

              <QuickAction
                icon={<Video size={19} />}
                title="Capture Meeting"
                className="border-[#373078] bg-[#211b55]"
                onClick={() =>
                  setComingSoonFeature("Capture Meeting")
                }
              />
            </div>
          </section>
          

          {/* Recent meetings */}
          <section className="mt-11">
            <div className="flex items-center justify-between">
              <div className="flex rounded-md bg-[#292929] p-1 text-sm">
                <button
                  type="button"
                  className="rounded bg-[#4b4b4b] px-4 py-1.5 text-white"
                >
                  Recent
                </button>

                <button
                  type="button"
                  className="px-4 py-1.5 text-[#b5b5b5]"
                >
                  Upcoming
                </button>

                <button
                  type="button"
                  className="px-4 py-1.5 text-[#b5b5b5]"
                >
                  AI Feed
                </button>
              </div>
            </div>

            <div className="mt-7 flex cursor-pointer items-center gap-4 rounded-lg px-4 py-4 transition-colors hover:bg-[#1b1b1b]">
              <Logo size={36} />

              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-medium">
                  Fireflies AI Platform Quick Overview
                </div>

                <div className="mt-1 text-sm text-[#898989]">
                  Thu, Aug 8 2024, 3:52 PM
                </div>
              </div>

              <ChevronRight
                size={18}
                className="text-[#747474]"
              />
            </div>
          </section>
        </div>
      </main>

      {/* Help button */}
      <button
        type="button"
        aria-label="Help"
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#d9d2ff] text-xl font-semibold text-[#20185c] shadow-xl"
      >
        ?
      </button>
      {comingSoonFeature && (
  <ComingSoonModal
    feature={comingSoonFeature}
    onClose={() =>
      setComingSoonFeature(null)
    }
  />
)}
    </div>
  );
}

type QuickActionProps = {
  icon: React.ReactNode;
  title: string;
  className: string;
  onClick: () => void;
};

function QuickAction({
  icon,
  title,
  className,
  onClick,
}: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[60px] items-center gap-3 rounded-lg border px-5 text-left transition-[filter] hover:brightness-110 ${className}`}
    >
      <span className="opacity-70">
        {icon}
      </span>

      <span className="flex-1 text-[15px]">
        {title}
      </span>

      <ChevronRight
        size={17}
        className="opacity-70"
      />
    </button>
  );
}