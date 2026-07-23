import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  tool: z.enum(["email", "planner", "research"]),
  payload: z.record(z.string(), z.any()),
});

function buildPrompt(tool: string, payload: Record<string, any>): string {
  if (tool === "email") {
    return `Goal: Draft a professional email that clearly communicates the sender's purpose to the recipient.

Context: The user is a professional writing a workplace email. The email should match the requested tone and be ready to send.

User Input:
- Recipient: ${payload.recipient || "(unspecified)"}
- Purpose: ${payload.purpose || "(unspecified)"}
- Key points: ${payload.keyPoints || "(none provided)"}
- Tone: ${payload.tone || "Formal"}

Instructions:
- Write in the requested tone consistently.
- Include a clear, concise subject line.
- Keep the body focused, well-structured, and free of filler.
- Sign off appropriately without inventing a sender name (use a placeholder like "[Your name]").

Output Format:
Return ONLY valid JSON with this exact shape, no code fences, no commentary:
{"subject": "string", "body": "string with \\n newlines"}`;
  }

  if (tool === "planner") {
    return `Goal: Produce a prioritized, time-blocked schedule the user can follow immediately.

Context: The user is a working professional planning their ${payload.scope || "day"}. Prioritize by urgency and impact, respect deadlines, and fit everything within working hours.

User Input:
- Scope: ${payload.scope || "Daily"}
- Working hours: ${payload.startTime || "09:00"} to ${payload.endTime || "17:00"}
- Tasks (with any deadlines):
${payload.tasks || "(no tasks provided)"}

Instructions:
- Order tasks by priority (deadline + importance).
- Assign each task a concrete time block within the working hours.
- Include short breaks between deep-work blocks.
- Add a brief 1-line rationale for the top priority.

Output Format:
Plain text schedule using this shape (one line per block):

HH:MM - HH:MM  Task name  (priority: High/Med/Low)

Follow with a short "Notes" section (2-3 bullet points) at the end.`;
  }

  // research
  return `Goal: Help the user quickly understand a topic or article and decide what to do next.

Context: The user is doing workplace research and needs concise, trustworthy analysis.

User Input:
${payload.content || "(no content provided)"}

Instructions:
- Be objective and specific; avoid vague generalities.
- Insights should surface non-obvious points, not restate the summary.
- Recommendations must be actionable.

Output Format:
Return ONLY valid JSON with this exact shape, no code fences, no commentary:
{"summary": "string", "insights": ["string", "string", ...], "recommendations": ["string", "string", ...]}`;
}

function extractJson(text: string): any {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export const generateContent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const prompt = buildPrompt(data.tool, data.payload);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are an expert workplace productivity assistant. Follow the requested output format precisely.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to your workspace.");
      throw new Error(`AI request failed (${res.status}): ${errText}`);
    }

    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "";

    if (data.tool === "planner") {
      return { tool: "planner" as const, text };
    }
    if (data.tool === "email") {
      const parsed = extractJson(text);
      return {
        tool: "email" as const,
        subject: String(parsed.subject ?? ""),
        body: String(parsed.body ?? ""),
      };
    }
    const parsed = extractJson(text);
    return {
      tool: "research" as const,
      summary: String(parsed.summary ?? ""),
      insights: Array.isArray(parsed.insights) ? parsed.insights.map(String) : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.map(String)
        : [],
    };
  });