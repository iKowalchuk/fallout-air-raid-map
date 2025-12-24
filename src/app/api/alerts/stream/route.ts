import { apiToProjectRegionId } from "@/data/regionMapping";

const API_BASE_URL = process.env.ALERTS_API_URL || "https://alerts.com.ua";
const API_KEY = process.env.ALERTS_API_KEY || "";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // If no API key, return error
  if (!API_KEY) {
    return new Response(
      JSON.stringify({ error: "API key not configured" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Connect to API SSE endpoint
        const response = await fetch(`${API_BASE_URL}/api/states/live`, {
          headers: {
            "X-API-Key": API_KEY,
            Accept: "text/event-stream",
          },
        });

        if (!response.ok) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Failed to connect to API" })}\n\n`)
          );
          controller.close();
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        // Read SSE stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const eventData = JSON.parse(line.slice(6));

                // Transform data
                const projectRegionId = apiToProjectRegionId(eventData.id);
                if (projectRegionId) {
                  const transformedEvent = {
                    regionId: projectRegionId,
                    isActive: eventData.alert,
                    alertType: "air_raid",
                    startTime: eventData.changed || new Date().toISOString(),
                  };

                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(transformedEvent)}\n\n`)
                  );
                }
              } catch {
                // Skip invalid data
              }
            } else if (line.startsWith(":")) {
              // Heartbeat/comment - forward as is
              controller.enqueue(encoder.encode(`${line}\n`));
            }
          }
        }

        controller.close();
      } catch (error) {
        console.error("SSE stream error:", error);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
