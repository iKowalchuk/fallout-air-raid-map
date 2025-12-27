"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientAlertMessage, ClientCacheStatus } from "@/features/alerts";
import { useThrottle } from "@/hooks/use-throttle";

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

interface MessageLogProps {
  messages: ClientAlertMessage[];
  cacheStatus?: ClientCacheStatus | null;
}

// Stylized message counter component in Pip-Boy style
// Uses key-based animation: CSS animation replays when key changes
function MessageCounter({ count }: { count: number }) {
  // Format count with leading zeros for consistent width
  const formattedCount = count.toString().padStart(3, " ");

  return (
    <div className="message-counter" title="Кількість повідомлень">
      {/* Key forces re-mount on count change, restarting CSS animation */}
      <div key={count} className="counter-frame counter-pulse">
        <div className="counter-scanline" />
        <span className="counter-label">REC</span>
        <span className="counter-value">{formattedCount}</span>
      </div>
    </div>
  );
}

// Sync progress indicator component
function SyncProgress({ cacheStatus }: { cacheStatus: ClientCacheStatus }) {
  const { cachedRegions, totalRegions, isComplete } = cacheStatus;
  const segments = 20; // Number of visual segments
  const filledSegments = Math.round((cachedRegions / totalRegions) * segments);

  return (
    <div
      className={`sync-progress-container font-[family-name:var(--font-pipboy)] ${isComplete ? "sync-complete" : ""}`}
    >
      <div className="sync-progress-scanline" />
      <div className="sync-text">
        <span>{isComplete ? "SYNC COMPLETE" : "SYNCING REGIONS"}</span>
        <span className="sync-counter">
          {cachedRegions}/{totalRegions}
        </span>
      </div>
      <div className="sync-progress-bar">
        {Array.from({ length: segments }, (_, i) => ({
          id: `segment-${i}`,
          index: i,
        })).map((segment) => (
          <div
            key={segment.id}
            className={`sync-segment ${
              segment.index < filledSegments
                ? "filled"
                : segment.index === filledSegments && !isComplete
                  ? "active"
                  : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Get icon and accessible label based on message type
function getMessageIcon(type: ClientAlertMessage["type"]): {
  icon: string;
  label: string;
} {
  switch (type) {
    case "alert_start":
      return { icon: "⚠", label: "Тривога" };
    case "alert_end":
      return { icon: "✓", label: "Відбій" };
    case "missile_detected":
      return { icon: "⚠", label: "Ракета" };
    case "uav_detected":
      return { icon: "⚠", label: "БПЛА" };
    case "info":
      return { icon: "●", label: "Інформація" };
    default:
      return { icon: "●", label: "Повідомлення" };
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

export default function MessageLog({ messages, cacheStatus }: MessageLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const prevMessagesLength = useRef(messages.length);
  const [newMessageCount, setNewMessageCount] = useState(0);

  // Messages are already sorted by API (newest first)

  // Auto-scroll to top when new messages arrive and track new messages
  useEffect(() => {
    const newCount = messages.length - prevMessagesLength.current;
    if (newCount > 0) {
      if (isAtTop && scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      } else {
        setNewMessageCount((prev) => prev + newCount);
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages, isAtTop]);

  // Throttled scroll handler for performance (100ms = ~10fps instead of every pixel)
  const handleScrollInternal = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop } = scrollRef.current;
    const wasAtTop = isAtTop;
    const nowAtTop = scrollTop < 50;
    setIsAtTop(nowAtTop);

    // Clear new message count when scrolling to top
    if (nowAtTop && !wasAtTop) {
      setNewMessageCount(0);
    }
  }, [isAtTop]);

  const handleScroll = useThrottle(handleScrollInternal, 100);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Sync progress indicator */}
      {cacheStatus && !cacheStatus.isComplete && (
        <SyncProgress cacheStatus={cacheStatus} />
      )}

      {/* Header with inline compact legend */}
      <div className="mt-1 mb-1 sm:mt-3 sm:mb-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center sm:justify-start">
            <span className="glow-text font-[family-name:var(--font-pipboy)] text-[10px] opacity-70 sm:text-xs">
              ▸ MESSAGE LOG
            </span>
          </div>
          <div className="flex w-full items-center justify-between gap-1.5 sm:w-auto sm:gap-5">
            {/* Compact inline legend - matching TimelineBar style */}
            <div className="flex flex-wrap items-center gap-1.5 font-[family-name:var(--font-pipboy)] text-[8px] sm:gap-4 sm:text-[10px]">
              <div className="flex items-center gap-1" title="Ракетна загроза">
                <span
                  className="inline-block h-2.5 w-[3px] rounded-sm sm:h-3"
                  style={{
                    backgroundColor: "var(--pipboy-alert-red)",
                    boxShadow: "0 0 4px var(--pipboy-alert-red)",
                  }}
                />
                <span className="text-[var(--pipboy-alert-red)] opacity-50">
                  Ракети
                </span>
              </div>
              <div className="flex items-center gap-1" title="Тривога / БПЛА">
                <span
                  className="inline-block h-2.5 w-[3px] rounded-sm sm:h-3"
                  style={{
                    backgroundColor: "var(--pipboy-amber)",
                    boxShadow: "0 0 4px var(--pipboy-amber)",
                  }}
                />
                <span className="text-[var(--pipboy-amber)] opacity-50">
                  Тривога
                </span>
              </div>
              <div className="flex items-center gap-1" title="Відбій тривоги">
                <span
                  className="inline-block h-2.5 w-[3px] rounded-sm sm:h-3"
                  style={{
                    backgroundColor: "var(--pipboy-green-dim)",
                    boxShadow: "none",
                  }}
                />
                <span className="text-[var(--pipboy-green)] opacity-50">
                  Відбій
                </span>
              </div>
              <div
                className="flex items-center gap-1"
                title="Системне повідомлення"
              >
                <span
                  className="inline-block h-2.5 w-[3px] rounded-sm sm:h-3"
                  style={{
                    backgroundColor: "var(--pipboy-cyan)",
                    boxShadow: "0 0 4px var(--pipboy-cyan)",
                  }}
                />
                <span className="text-[var(--pipboy-cyan)] opacity-50">
                  Інфо
                </span>
              </div>
            </div>
            <MessageCounter count={messages.length} />
          </div>
        </div>
      </div>

      {/* Message container with scroll button */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          role="log"
          aria-label="Журнал повідомлень про тривоги"
          aria-live="polite"
          aria-atomic="false"
          className="message-log-container absolute inset-0 overflow-y-auto font-[family-name:var(--font-pipboy)]"
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <span className="glow-text text-sm opacity-50">
                Немає повідомлень
              </span>
            </div>
          ) : (
            <div className="space-y-0.5">
              {messages.map((msg, index) => {
                const threatLevel = getThreatLevel(msg.type);
                const { icon, label: iconLabel } = getMessageIcon(msg.type);
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
                      aria-hidden="true"
                    />

                    {/* Icon with accessible label - hidden on very small screens */}
                    <span
                      className={`message-icon xs:inline hidden sm:inline ${
                        threatLevel === "high" || threatLevel === "medium"
                          ? "glow-text-red"
                          : threatLevel === "clear"
                            ? "glow-text-bright"
                            : "glow-text"
                      }`}
                      aria-label={iconLabel}
                      role="img"
                    >
                      {icon}
                    </span>

                    {/* Timestamp */}
                    <span className="message-log-timestamp text-[10px] opacity-60 sm:text-xs">
                      <time dateTime={msg.timestamp.toISOString()}>
                        {formatTimestamp(msg.timestamp)}
                      </time>
                    </span>

                    {/* Region name */}
                    <span
                      className={`message-region truncate text-[10px] font-medium sm:text-xs sm:whitespace-nowrap ${
                        msg.type === "alert_start" ||
                        msg.type === "missile_detected"
                          ? "glow-text-red-bright"
                          : msg.type === "alert_end"
                            ? "glow-text-bright"
                            : "glow-text"
                      }`}
                    >
                      {msg.regionName}
                    </span>

                    {/* Message text */}
                    <span
                      className={`message-text min-w-0 flex-1 truncate text-[10px] sm:text-xs ${
                        msg.type === "alert_start" ||
                        msg.type === "missile_detected"
                          ? "text-[var(--pipboy-alert-red)] opacity-90"
                          : msg.type === "alert_end"
                            ? "text-[var(--pipboy-green-bright)] opacity-90"
                            : "glow-text opacity-70"
                      }`}
                    >
                      {msg.message}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Scroll to top button - shows actual new message count */}
        {!isAtTop && (
          <button
            type="button"
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
                setNewMessageCount(0);
              }
            }}
            className="scroll-to-top-btn"
            aria-label={
              newMessageCount > 0
                ? `Прокрутити вгору, ${newMessageCount} нових повідомлень`
                : "Прокрутити вгору"
            }
          >
            <span className="scroll-btn-icon" aria-hidden="true">
              ▲
            </span>
            <span>
              {newMessageCount > 0 ? `${newMessageCount} нових` : "До початку"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
