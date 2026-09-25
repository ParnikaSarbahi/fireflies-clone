"use client";

import { useState } from "react";
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
import ComingSoonModal from "../ui/ComingSoonModal";

const mainItems = [
  {
    icon: Home,
    label: "Home",
    href: "/",
  },
  {
    icon: Bot,
    label: "Meetings",
    href: "/meetings",
  },
  {
    icon: Video,
    label: "Capture",
  },
  {
    icon: ListChecks,
    label: "Tasks",
  },
  {
    icon: Sparkles,
    label: "AskFred",
  },
  {
    icon: BarChart3,
    label: "Analytics",
  },
  {
    icon: Layers3,
    label: "Integrations",
  },
  {
    icon: Zap,
    label: "Automations",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [
    comingSoonFeature,
    setComingSoonFeature,
  ] = useState<string | null>(null);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[60px] flex-col border-r border-[#292929] bg-[#171717]">
        {/* Logo */}
        <div className="flex h-[72px] items-center justify-center">
          <Logo size={27} />
        </div>

        {/* Main navigation */}
        <nav className="flex flex-1 flex-col items-center gap-2 px-2">
          {mainItems.map(
            ({
              icon: Icon,
              label,
              href,
            }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : Boolean(
                      href &&
                        pathname.startsWith(
                          href
                        )
                    );

              // Real pages
              if (href) {
                return (
                  <Link
                    key={label}
                    href={href}
                    title={label}
                    aria-label={label}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                      active
                        ? "bg-[#2b2b2b] text-white"
                        : "text-[#a6a6a6] hover:bg-[#242424] hover:text-white"
                    }`}
                  >
                    <Icon
                      size={19}
                      strokeWidth={1.7}
                    />
                  </Link>
                );
              }

              // Placeholder features
              return (
                <button
                  key={label}
                  type="button"
                  title={label}
                  aria-label={label}
                  onClick={() =>
                    setComingSoonFeature(
                      label
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-[#a6a6a6] transition-colors hover:bg-[#242424] hover:text-white"
                >
                  <Icon
                    size={19}
                    strokeWidth={1.7}
                  />
                </button>
              );
            }
          )}
        </nav>

        {/* Bottom navigation */}
        <div className="flex flex-col items-center gap-2 border-t border-[#292929] py-3">
          {/* Invite */}
          <button
            type="button"
            title="Invite members"
            aria-label="Invite members"
            onClick={() =>
              setComingSoonFeature(
                "Team & Sharing"
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#a6a6a6] transition-colors hover:bg-[#242424] hover:text-white"
          >
            <UserPlus
              size={19}
              strokeWidth={1.7}
            />
          </button>

          {/* Settings */}
          <button
            type="button"
            title="Settings"
            aria-label="Settings"
            onClick={() =>
              setComingSoonFeature(
                "Settings"
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#a6a6a6] transition-colors hover:bg-[#242424] hover:text-white"
          >
            <Settings
              size={19}
              strokeWidth={1.7}
            />
          </button>

          {/* Default logged-in user */}
          <button
            type="button"
            title="Profile"
            aria-label="Profile"
            onClick={() =>
              setComingSoonFeature(
                "Profile"
              )
            }
            className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            P
          </button>
        </div>
      </aside>

      {/* Placeholder modal */}
      {comingSoonFeature && (
        <ComingSoonModal
          feature={
            comingSoonFeature
          }
          onClose={() =>
            setComingSoonFeature(
              null
            )
          }
        />
      )}
    </>
  );
}