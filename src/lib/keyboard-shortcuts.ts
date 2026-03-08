import { useEffect, useCallback, useRef } from "react";

export interface KeyboardShortcut {
  key: string;
  modifiers?: {
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
  };
  description: string;
  category: "navigation" | "global" | "analysis" | "ui";
  action: () => void;
}

export interface ShortcutSequence {
  keys: string[];
  currentIndex: number;
}

export interface ShortcutDefinition {
  id: string;
  key: string;
  modifiers?: {
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
  };
  description: string;
  category: "navigation" | "global" | "analysis" | "ui";

  sequence?: string;
}

export function getModifierString(modifiers?: ShortcutDefinition["modifiers"]): string {
  if (!modifiers) return "";

  const parts: string[] = [];
  if (modifiers.ctrl || modifiers.meta) {
    parts.push(typeof navigator !== "undefined" && navigator.platform.includes("Mac") ? "⌘" : "Ctrl");
  }
  if (modifiers.shift) {
    parts.push("⇧");
  }
  if (modifiers.alt) {
    parts.push(typeof navigator !== "undefined" && navigator.platform.includes("Mac") ? "⌥" : "Alt");
  }
  return parts.join("");
}

export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: ShortcutDefinition
): boolean {
  const key = shortcut.key.toLowerCase();
  const eventKey = event.key.toLowerCase();

  if (key !== eventKey) {
    return false;
  }

  const ctrlMatch = shortcut.modifiers?.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
  const shiftMatch = shortcut.modifiers?.shift ? event.shiftKey : !event.shiftKey;
  const altMatch = shortcut.modifiers?.alt ? event.altKey : !event.altKey;

  const metaCtrlMatch = shortcut.modifiers?.meta ? event.metaKey : true;

  return ctrlMatch && shiftMatch && altMatch && metaCtrlMatch;
}

export function isInputElement(element: EventTarget | null): boolean {
  if (!element || !(element instanceof HTMLElement)) return false;

  const tagName = element.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    element.isContentEditable
  );
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  const sequenceRef = useRef<ShortcutSequence | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;
      const inInput = isInputElement(target);

      const allowInInput = ["/", "k", "b"].includes(event.key.toLowerCase()) &&
        (event.metaKey || event.ctrlKey);

      if (inInput && !allowInInput) {

        if (sequenceRef.current) {
          clearSequenceTimeout();
        }
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        const escapeShortcut = shortcuts.find(s => s.key === "Escape");
        if (escapeShortcut) {
          escapeShortcut.action();
        }
        return;
      }

      if (event.key.toLowerCase() === "g" && !event.shiftKey && !event.ctrlKey && !event.metaKey && !inInput) {
        event.preventDefault();

        if (!sequenceRef.current) {
          sequenceRef.current = {
            keys: ["g"],
            currentIndex: 0,
          };
        }

        setSequenceTimeout();
        return;
      }

      if (sequenceRef.current && sequenceRef.current.keys[0] === "g") {
        const navShortcuts: Record<string, () => void> = {
          d: () => {
            const shortcut = shortcuts.find(s => s.key === "gd");
            if (shortcut) shortcut.action();
          },
          h: () => {
            const shortcut = shortcuts.find(s => s.key === "gh");
            if (shortcut) shortcut.action();
          },
          a: () => {
            const shortcut = shortcuts.find(s => s.key === "ga");
            if (shortcut) shortcut.action();
          },
          s: () => {
            const shortcut = shortcuts.find(s => s.key === "gs");
            if (shortcut) shortcut.action();
          },
        };

        const action = navShortcuts[event.key.toLowerCase()];
        if (action) {
          event.preventDefault();
          action();
        }

        clearSequenceTimeout();
        return;
      }

      const shortcut = shortcuts.find((s) => {
        const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();

        if (!keyMatch) return false;

        const ctrlMatch = s.modifiers?.ctrl ? (event.ctrlKey || event.metaKey) :
                         (s.modifiers?.meta ? event.metaKey : !event.ctrlKey && !event.metaKey);
        const shiftMatch = s.modifiers?.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = s.modifiers?.alt ? event.altKey : !event.altKey;

        return ctrlMatch && shiftMatch && altMatch;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    },
    [shortcuts, enabled]
  );

  const setSequenceTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      sequenceRef.current = null;
    }, 1000);
  }, []);

  const clearSequenceTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    sequenceRef.current = null;
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleKeyDown]);
}

export function getAllShortcuts(): ShortcutDefinition[] {
  return [

    { id: "gd", key: "d", sequence: "g", description: "Go to Dashboard", category: "navigation" },
    { id: "gh", key: "h", sequence: "g", description: "Go to History", category: "navigation" },
    { id: "ga", key: "a", sequence: "g", description: "Go to Analytics", category: "navigation" },
    { id: "gs", key: "s", sequence: "g", description: "Go to Settings", category: "navigation" },

    { id: "search", key: "/", description: "Focus search", category: "global" },
    { id: "search-cmd", key: "k", modifiers: { ctrl: true }, description: "Focus search", category: "global" },
    { id: "help", key: "/", modifiers: { shift: true }, description: "Show keyboard shortcuts", category: "global" },
    { id: "help-question", key: "?", description: "Show keyboard shortcuts", category: "global" },
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
}
