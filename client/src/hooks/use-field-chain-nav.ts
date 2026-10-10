"use client";

import { useRef } from "react";

type Focusable = { focus: () => void } | null;

interface ChainOptions {
  // Date inputs use ↑/↓ natively to step the focused day/month/year segment —
  // set this to false there so only Enter advances the chain.
  allowArrows?: boolean;
}

// Shared "Enter/↓ moves to the next field, ↑ moves back" chain for dialog forms,
// terminating on the submit button. Select and Textarea fields are deliberately
// left out of the chain (Tab still reaches them) since both already give ↑/↓ a
// real native meaning — opening/paging a listbox, moving a text caret — that this
// would otherwise clobber.
export function useFieldChainNav(length: number) {
  const refs = useRef<Focusable[]>([]);

  function registerRef(index: number) {
    return (el: Focusable) => { refs.current[index] = el; };
  }

  function focusField(index: number) {
    refs.current[index]?.focus();
  }

  function handleKeyDown(index: number, options?: ChainOptions) {
    const allowArrows = options?.allowArrows ?? true;
    return (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        if (index < length - 1) { e.preventDefault(); focusField(index + 1); }
        return;
      }
      if (!allowArrows) return;
      if (e.key === "ArrowDown" && index < length - 1) { e.preventDefault(); focusField(index + 1); }
      else if (e.key === "ArrowUp" && index > 0) { e.preventDefault(); focusField(index - 1); }
    };
  }

  return { registerRef, handleKeyDown, focusField };
}
