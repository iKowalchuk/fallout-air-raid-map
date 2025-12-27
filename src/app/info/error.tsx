"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function InfoError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("Info page error:", error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-4">
      {/* Vault-Tec styled error display */}
      <div className="flex flex-col items-center gap-4">
        <pre className="glow-text-red text-center font-[family-name:var(--font-pipboy)] text-xs opacity-80">
          {`
  ╔═══════════════════════════════╗
  ║     ⚠ SYSTEM MALFUNCTION ⚠    ║
  ║                               ║
  ║   VAULT-TEC SYSTEMS OFFLINE   ║
  ╚═══════════════════════════════╝
          `}
        </pre>

        <div className="max-w-md text-center">
          <p className="glow-text-red mb-2 font-[family-name:var(--font-pipboy)] text-lg">
            ПОМИЛКА СИСТЕМИ
          </p>
          <p className="text-pipboy-green-dim text-sm">
            Виникла непередбачена помилка під час завантаження даних.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-pipboy-green-dark">
              Код помилки: {error.digest}
            </p>
          )}
        </div>
      </div>

      {/* Retry button */}
      <button
        type="button"
        onClick={reset}
        className="nav-tab nav-tab-active cursor-pointer border border-pipboy-green-dark px-6 py-2 font-[family-name:var(--font-pipboy)] transition-all hover:border-pipboy-green hover:shadow-[0_0_10px_rgba(0,255,0,0.3)]"
      >
        ↻ ПОВТОРИТИ
      </button>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-xs text-pipboy-green-dim">
        <div className="status-dot-alert h-2 w-2" />
        <span>Статус: критична помилка</span>
      </div>
    </div>
  );
}
