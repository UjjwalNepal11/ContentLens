"use client";

import { useEffect, useCallback } from "react";
import { X, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShortcutDefinition, getModifierString } from "@/lib/keyboard-shortcuts";

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts: ShortcutDefinition[] = [

  { id: "gd", key: "g", description: "Press G then...", category: "navigation" },
  { id: "gd-sub", key: "d", sequence: "g", description: "Go to Dashboard", category: "navigation" },
  { id: "gh-sub", key: "h", sequence: "g", description: "Go to History", category: "navigation" },
  { id: "ga-sub", key: "a", sequence: "g", description: "Go to Analytics", category: "navigation" },
  { id: "gs-sub", key: "s", sequence: "g", description: "Go to Settings", category: "navigation" },

  { id: "search", key: "/", description: "Focus search", category: "global" },
  { id: "search-cmd", key: "k", modifiers: { ctrl: true }, description: "Focus search", category: "global" },
  { id: "help", key: "?", description: "Show keyboard shortcuts", category: "global" },
  { id: "help-shift", key: "/", modifiers: { shift: true }, description: "Show keyboard shortcuts", category: "global" },
  { id: "toggle-theme", key: "m", description: "Toggle theme (dark/light)", category: "global" },
  { id: "toggle-sidebar", key: "b", modifiers: { ctrl: true }, description: "Toggle sidebar", category: "global" },

  { id: "new-analysis", key: "n", description: "New analysis (focus text input)", category: "analysis" },
  { id: "text-tab", key: "t", description: "Switch to Text Analysis tab", category: "analysis" },
  { id: "image-tab", key: "i", description: "Switch to Image Analysis tab", category: "analysis" },
  { id: "submit-analysis", key: "Enter", modifiers: { ctrl: true }, description: "Submit analysis", category: "analysis" },

  { id: "prev-item", key: "[", description: "Previous item", category: "ui" },
  { id: "next-item", key: "]", description: "Next item", category: "ui" },
  { id: "close", key: "Escape", description: "Close modal / Cancel", category: "ui" },
];

function ShortcutKey({ shortcut }: { shortcut: ShortcutDefinition }) {
  const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac");

  if (shortcut.sequence) {
    return (
      <div className="flex items-center gap-1">
        <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono">
          {shortcut.sequence}
        </kbd>
        <span className="text-slate-400">then</span>
        <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono">
          {shortcut.key}
        </kbd>
      </div>
    );
  }

  const modifier = getModifierString(shortcut.modifiers);

  if (modifier) {
    const keys = modifier.split("");
    return (
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <kbd key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono">
            {key}
          </kbd>
        ))}
        <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono">
          {isMac && shortcut.key === "Control" ? "⌃" : shortcut.key}
        </kbd>
      </div>
    );
  }

  return (
    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono">
      {shortcut.key === " " ? "Space" : shortcut.key}
    </kbd>
  );
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const navigationShortcuts = shortcuts.filter(s => s.category === "navigation" && s.sequence);
  const globalShortcuts = shortcuts.filter(s => s.category === "global");
  const analysisShortcuts = shortcuts.filter(s => s.category === "analysis");
  const uiShortcuts = shortcuts.filter(s => s.category === "ui");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {}
      <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Keyboard className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
          {}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-slate-700 dark:text-slate-300">Press G then...</span>
                <ShortcutKey shortcut={{ id: "g-key", key: "g", description: "", category: "navigation" }} />
              </div>
              <div className="pl-4 space-y-2 border-l-2 border-slate-200 dark:border-slate-700">
                {navigationShortcuts.map((shortcut) => (
                  <div key={shortcut.id} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{shortcut.description}</span>
                    <ShortcutKey shortcut={shortcut} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Global
            </h3>
            <div className="space-y-2">
              {globalShortcuts.map((shortcut) => (
                <div key={shortcut.id} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{shortcut.description}</span>
                  <ShortcutKey shortcut={shortcut} />
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Analysis
            </h3>
            <div className="space-y-2">
              {analysisShortcuts.map((shortcut) => (
                <div key={shortcut.id} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{shortcut.description}</span>
                  <ShortcutKey shortcut={shortcut} />
                </div>
              ))}
            </div>
          </div>

          {}
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              UI
            </h3>
            <div className="space-y-2">
              {uiShortcuts.map((shortcut) => (
                <div key={shortcut.id} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{shortcut.description}</span>
                  <ShortcutKey shortcut={shortcut} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">?</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">⇧+/</kbd> to show this help anytime
          </p>
        </div>
      </div>
    </div>
  );
}
