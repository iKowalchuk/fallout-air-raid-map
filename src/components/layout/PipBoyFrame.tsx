"use client";

import { ReactNode } from "react";
import Header from "./Header";

interface PipBoyFrameProps {
  children: ReactNode;
  activeTab: "info" | "map";
}

export default function PipBoyFrame({ children, activeTab }: PipBoyFrameProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
      <div className="pipboy-frame w-full max-w-5xl">
        <div className="pipboy-screen flex h-[600px] flex-col md:h-[700px]">
          <Header activeTab={activeTab} />
          <main className="flex-1 overflow-hidden p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
