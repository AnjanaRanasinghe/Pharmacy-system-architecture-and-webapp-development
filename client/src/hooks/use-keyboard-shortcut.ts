"use client";

import { useEffect, useRef } from "react";

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
}

interface UseKeyboardShortcutOptions {
  // Function keys have no default behavior while typing, so they fire regardless
  // of focus. Character keys (like "/") must opt in explicitly, or they'd hijack
  // normal typing in any text field.
  allowInInputs?: boolean;
  enabled?: boolean;
}

// Page-scoped keyboard shortcut (e.g. F2/F4/F9 while a specific page is mounted).
// Always calls the latest handler without re-subscribing the listener.
export function useKeyboardShortcut(key: string, handler: (e: KeyboardEvent) => void, options?: UseKeyboardShortcutOptions) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const { allowInInputs = false, enabled = true } = options ?? {};

  useEffect(() => {
    if (!enabled) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      if (!allowInInputs && isTypingTarget(e.target)) return;
      handlerRef.current(e);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, allowInInputs, enabled]);
}
