"use client";

import type { ClientAlertMessage } from "@/schemas";
import { useEffect, useRef, useState } from "react";

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

interface MessageLogProps {
  messages: ClientAlertMessage[];
}

// Get icon based on message type
function getMessageIcon(type: ClientAlertMessage["type"]): string {
  switch (type) {
    case "alert_start":
      return "⚠";
    case "alert_end":
      return "✓";
    case "missile_detected":
      return "⚠";
    case "uav_detected":
      return "⚠";
    case "info":
      return "●";
    default:
      return "●";
  }
}

// Get threat level indicator
function getThreatLevel(
  type: ClientAlertMessage["type"],
): "high" | "medium" | "low" | "clear" {
  switch (type) {
    case "missile_detected":
      return "high";
    case "alert_start":
    case "uav_detected":
      return "medium";
    case "alert_end":
      return "clear";
    case "info":
    default:
      return "low";
  }
}

// Get threat level label for tooltip
function getThreatLabel(level: "high" | "medium" | "low" | "clear"): string {
  switch (level) {
    case "high":
      return "Ракетна загроза";
    case "medium":
      return "Тривога / БПЛА";
    case "clear":
      return "Відбій";
    case "low":
      return "Інформація";
  }
}

export default function MessageLog({ messages }: MessageLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const prevMessagesLength = useRef(messages.length);

  // Reverse messages so newest are at the top
  const reversedMessages = [...messages].reverse();

  // Auto-scroll to top when new messages arrive
  useEffect(() => {
    if (
      isAtTop &&
      scrollRef.current &&
      messages.length > prevMessagesLength.current
    ) {
      scrollRef.current.scrollTop = 0;
    }
    prevMessagesLength.current = messages.length;
  }, [messages, isAtTop]);

  // Detect manual scroll to disable auto-scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop } = scrollRef.current;
    setIsAtTop(scrollTop < 50);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Header with inline compact legend */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <span className="glow-text font-[family-name:var(--font-pipboy)] text-xs opacity-70">
            ▸ MESSAGE LOG
          </span>
          <div className="flex items-center gap-3">
            {/* Compact inline legend - all 4 statuses */}
            <div className="inline-legend flex items-center gap-2 font-[family-name:var(--font-pipboy)] text-[10px]">
              <div className="flex items-center gap-1" title="Ракетна загроза">
                <span
                  className="inline-block h-2 w-1 rounded-sm bg-[var(--pipboy-alert-red)]"
                  style={{ boxShadow: "0 0 3px var(--pipboy-alert-red)" }}
                />
                <span className="text-[var(--pipboy-alert-red)] opacity-70">
                  Ракети
                </span>
              </div>
              <div className="flex items-center gap-1" title="Тривога / БПЛА">
                <span className="inline-block h-2 w-1 rounded-sm bg-[var(--pipboy-amber)]" />
                <span className="text-[var(--pipboy-amber)] opacity-70">
                  Тривога
                </span>
              </div>
              <div className="flex items-center gap-1" title="Відбій тривоги">
                <span className="inline-block h-2 w-1 rounded-sm bg-[var(--pipboy-green)]" />
                <span className="text-[var(--pipboy-green)] opacity-70">
                  Відбій
                </span>
              </div>
              <div
                className="flex items-center gap-1"
                title="Системне повідомлення"
              >
                <span className="inline-block h-2 w-1 rounded-sm bg-[var(--pipboy-cyan)]" />
                <span className="text-[var(--pipboy-cyan)] opacity-70">
                  Інфо
                </span>
              </div>
            </div>
            <span
              className="glow-text font-[family-name:var(--font-pipboy)] text-[10px] opacity-50"
              title="Кількість повідомлень"
            >
              [{messages.length}]
            </span>
          </div>
        </div>
      </div>

      {/* Message container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="message-log-container flex-1 overflow-auto font-[family-name:var(--font-pipboy)]"
      >
        <div className="space-y-0.5">
          {reversedMessages.map((msg, index) => {
            const threatLevel = getThreatLevel(msg.type);
            const icon = getMessageIcon(msg.type);
            const isNew = index < 3;

            return (
              <div
                key={msg.id}
                className={`message-log-entry-enhanced ${
                  threatLevel === "high"
                    ? "message-high"
                    : threatLevel === "medium"
                      ? "message-medium"
                      : threatLevel === "clear"
                        ? "message-clear"
                        : ""
                } ${isNew ? "message-new" : ""}`}
                style={{ animationDelay: `${(index % 5) * 0.05}s` }}
              >
                {/* Threat indicator bar with tooltip */}
                <div
                  className={`message-threat-bar threat-${threatLevel}`}
                  title={getThreatLabel(threatLevel)}
                />

                {/* Icon */}
                <span
                  className={`message-icon ${
                    threatLevel === "high" || threatLevel === "medium"
                      ? "glow-text-red"
                      : threatLevel === "clear"
                        ? "glow-text-bright"
                        : "glow-text"
                  }`}
                >
                  {icon}
                </span>

                {/* Timestamp */}
                <span className="message-log-timestamp opacity-60">
                  {formatTimestamp(msg.timestamp)}
                </span>

                {/* Region name */}
                <span
                  className={`message-region ${
                    msg.type === "alert_start" ||
                    msg.type === "missile_detected"
                      ? "glow-text-red"
                      : msg.type === "alert_end"
                        ? "glow-text-bright"
                        : "glow-text"
                  }`}
                >
                  {msg.regionName}
                </span>

                {/* Message text */}
                <span className="message-text glow-text opacity-80">
                  {msg.message}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll to top indicator */}
      {!isAtTop && (
        <button
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = 0;
              setIsAtTop(true);
            }
          }}
          className="scroll-to-top-btn"
        >
          Нові повідомлення
        </button>
      )}
    </div>
  );
}
