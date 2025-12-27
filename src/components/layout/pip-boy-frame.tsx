"use client";

import type { ReactNode } from "react";
import Header from "./header";

interface PipBoyFrameProps {
  children: ReactNode;
  activeTab: "info" | "map";
}

export default function PipBoyFrame({ children, activeTab }: PipBoyFrameProps) {
  // Mobile: use 100svh with small padding to show Pip-Boy frame
  // border (4px) + padding (6px) + outer padding (4px*2) = 18px total on mobile
  return (
    <div className="flex h-svh items-center justify-center overflow-hidden p-0.5 sm:min-h-dvh sm:p-4 md:p-8">
      <div className="pipboy-frame h-[calc(100svh-4px)] w-full sm:h-auto sm:max-w-5xl">
        <div className="pipboy-screen flex h-full flex-col sm:h-[calc(100dvh-96px)] md:h-[700px]">
          <Header activeTab={activeTab} />
          <main className="flex-1 overflow-hidden p-1 sm:p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
