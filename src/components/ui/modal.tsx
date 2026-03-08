"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  rightAction?: React.ReactNode;
}

export function Modal({ isOpen, onClose, children, title, rightAction }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby="modal-description"
    >
      {}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/30"
        aria-hidden="true"
      />

      {}
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        role="document"
      >
        {}
        {title && (
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <h2 id="modal-title" className="text-xl font-semibold dark:text-white">
              {title}
            </h2>
            <div className="flex items-center gap-2">
              {rightAction}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1 dark:hover:bg-gray-700 dark:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {}
        <div className="p-6" id="modal-description">
          {children}
        </div>
      </div>
    </div>
  );
}
