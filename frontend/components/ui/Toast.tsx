"use client";

import { CheckCircle2, X, XCircle } from "lucide-react";

type ToastProps = {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
};

export default function Toast({
  message,
  type = "success",
  onClose,
}: ToastProps) {
  const isSuccess = type === "success";

  return (
    <div className="fixed bottom-6 left-1/2 z-[200] -translate-x-1/2">
      <div className="flex min-w-[320px] items-center gap-3 rounded-lg border border-[#383838] bg-[#242424] px-4 py-3 shadow-2xl">
        {isSuccess ? (
          <CheckCircle2 size={18} className="text-emerald-400" />
        ) : (
          <XCircle size={18} className="text-red-400" />
        )}

        <span className="flex-1 text-sm text-[#e8e8e8]">
          {message}
        </span>

        <button
          type="button"
          onClick={onClose}
          className="text-[#888] hover:text-white"
          aria-label="Close notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}