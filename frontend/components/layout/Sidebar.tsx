"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BarChart3,
  Bot,
  Home,
  Layers3,
  ListChecks,
  Settings,
  Sparkles,
  UserPlus,
  Video,
  Zap,
} from "lucide-react";

import Logo from "../ui/Logo";

const mainItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Bot, label: "Meetings", href: "/meetings" },
  { icon: Video, label: "Capture", href: "#" },
  { icon: ListChecks, label: "Tasks", href: "#" },
  { icon: Sparkles, label: "AskFred", href: "#" },
  { icon: BarChart3, label: "Analytics", href: "#" },
  { icon: Layers3, label: "Integrations", href: "#" },
  { icon: Zap, label: "Automations", href: "#" },
];

export default function Sidebar() {
    const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[60px] flex-col border-r border-[#292929] bg-[#171717]">
      <div className="flex h-[72px] items-center justify-center">
        <Logo size={27} />
      </div>

      <nav className="flex flex-1 flex-col items-center gap-2 px-2">
        {mainItems.map(({ icon: Icon, label, href }) => {
        const active =
            href === "/"
            ? pathname === "/"
            : href !== "#" && pathname.startsWith(href);

        return (
            <Link
            key={label}
            href={href}
            title={label}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                active
                ? "bg-[#2b2b2b] text-white"
                : "text-[#a6a6a6] hover:bg-[#242424] hover:text-white"
            }`}
            >
            <Icon size={19} strokeWidth={1.7} />
            </Link>
        );
        })}
      </nav>

      <div className="flex flex-col items-center gap-2 border-t border-[#292929] py-3">
        <button
          title="Invite members"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#a6a6a6] hover:bg-[#242424] hover:text-white"
        >
          <UserPlus size={19} strokeWidth={1.7} />
        </button>

        <button
          title="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#a6a6a6] hover:bg-[#242424] hover:text-white"
        >
          <Settings size={19} strokeWidth={1.7} />
        </button>

        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-xs font-semibold text-white">
          P
        </div>
      </div>
    </aside>
  );
}