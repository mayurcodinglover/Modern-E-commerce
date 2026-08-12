"use client";

import { X } from "lucide-react";
import { toast, Toaster, ToastBar } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster position="top-right">
      {(currentToast) => (
        <ToastBar toast={currentToast}>
          {({ icon, message }) => (
            <div className="flex w-full items-center gap-2">
              {icon}
              <span className="flex-1">{message}</span>
              <button
                type="button"
                onClick={() => toast.dismiss(currentToast.id)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
