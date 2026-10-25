"use client";

import { useState } from "react";

// A text box that hides what you type (like a password), with a Show/Hide button.
// Used for wallet addresses so people nearby can't read them over your shoulder.
export default function HiddenInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className={`${className} pr-20`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide wallet address" : "Show wallet address"}
        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
      >
        {visible ? "🙈 Hide" : "👁 Show"}
      </button>
    </div>
  );
}
