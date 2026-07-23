import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { ToolShell } from "@/components/tool-shell";
import { generateContent } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workplace AI" },
      {
        name: "description",
        content: "Summarize articles, surface insights, and get actionable recommendations.",
      },
      { property: "og:title", content: "AI Research Assistant — Workplace AI" },
      {
        property: "og:description",
        content: "Summarize articles, surface insights, and get actionable recommendations.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [insights, setInsights] = useState("");
  const [recommendations, setRecommendations] = useState("");

  const run = async () => {
    if (!content.trim()) {
      toast.error("Paste a topic or article first");
      return;
    }
    setLoading(true);
    try {
      const result = await generateContent({
        data: { tool: "research", payload: { content } },
      });
      if (result.tool === "research") {
        setSummary(result.summary);
        setInsights(result.insights.map((i: string) => `• ${i}`).join("\n"));
        setRecommendations(result.recommendations.map((r: string) => `• ${r}`).join("\n"));
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    const text = `SUMMARY\n${summary}\n\nKEY INSIGHTS\n${insights}\n\nRECOMMENDATIONS\n${recommendations}`;
    void navigator.clipboard.writeText(text);
  };

  const hasOutput = summary.length > 0 || insights.length > 0 || recommendations.length > 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="AI Research Assistant"
        description="Turn topics or articles into summaries, insights, and next steps."
      />
      <ToolShell
        title="Research input"
        description="Paste a topic, question, or full article."
        icon={<BookOpen className="h-5 w-5" />}
        onGenerate={run}
        onRegenerate={run}
        onCopy={copy}
        canCopy={hasOutput}
        loading={loading}
        hasOutput={hasOutput}
        inputs={
          <div className="space-y-2">
            <Label htmlFor="content">Topic or article</Label>
            <Textarea
              id="content"
              rows={16}
              placeholder="Paste an article or type a research question…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        }
        output={
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Summary will appear here"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insights">Key insights</Label>
              <Textarea
                id="insights"
                rows={5}
                value={insights}
                onChange={(e) => setInsights(e.target.value)}
                placeholder="Insights will appear here"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recommendations">Recommendations</Label>
              <Textarea
                id="recommendations"
                rows={5}
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="Recommendations will appear here"
              />
            </div>
          </div>
        }
      />
    </div>
  );
}