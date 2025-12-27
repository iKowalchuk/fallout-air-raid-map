"use client";

interface AlertStatusProps {
  isActive: boolean;
  alertCount: number;
}

export default function AlertStatus({
  isActive,
  alertCount,
}: AlertStatusProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className={`status-dot ${isActive ? "status-dot-alert" : ""}`} />
      <span
        className={`font-[family-name:var(--font-pipboy)] text-lg tracking-wide md:text-xl ${
          isActive ? "glow-text-red-bright" : "glow-text"
        }`}
      >
        {isActive ? "AIR RAID ALERT" : "ALL CLEAR"}
      </span>
      {isActive && (
        <span className="glow-text-red ml-2 text-sm">
          ({alertCount} регіонів)
        </span>
      )}
    </div>
  );
}
