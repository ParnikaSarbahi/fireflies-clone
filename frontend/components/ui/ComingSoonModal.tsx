"use client";

import { Sparkles, X } from "lucide-react";

type ComingSoonModalProps = {
  feature: string;
  onClose: () => void;
};

export default function ComingSoonModal({
  feature,
  onClose,
}: ComingSoonModalProps) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-5 backdrop-blur-[2px]">
      <div className="w-full max-w-[400px] rounded-xl border border-[#343434] bg-[#1b1b1b] p-6 text-center shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-[#888] hover:bg-[#292929] hover:text-white"
        >
          <X size={17} />
        </button>

        <div className="mx-auto mt-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#282039] text-[#ad91ff]">
          <Sparkles size={21} />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-white">
          {feature}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#888]">
          This feature is coming soon in this demo.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 h-9 rounded-md bg-[#6d32e9] px-5 text-sm font-medium text-white hover:bg-[#7b42ef]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}