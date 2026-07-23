import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { ToolShell } from "@/components/tool-shell";
import { generateContent } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workplace AI" },
      {
        name: "description",
        content: "Generate professional emails with the right tone in seconds.",
      },
      { property: "og:title", content: "Smart Email Generator — Workplace AI" },
      {
        property: "og:description",
        content: "Generate professional emails with the right tone in seconds.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState("Formal");
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const run = async () => {
    if (!purpose.trim()) {
      toast.error("Please describe the email's purpose");
      return;
    }
    setLoading(true);
    try {
      const result = await generateContent({
        data: { tool: "email", payload: { recipient, purpose, keyPoints, tone } },
      });
      if (result.tool === "email") {
        setSubject(result.subject);
        setBody(result.body);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    void navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
  };

  const hasOutput = subject.length > 0 || body.length > 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Smart Email Generator"
        description="Draft polished emails with the right tone in seconds."
      />
      <ToolShell
        title="Compose email"
        description="Fill in the details and pick a tone."
        icon={<Mail className="h-5 w-5" />}
        onGenerate={run}
        onRegenerate={run}
        onCopy={copy}
        canCopy={hasOutput}
        loading={loading}
        hasOutput={hasOutput}
        inputs={
          <>
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                placeholder="e.g. Sarah, Head of Marketing"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                placeholder="e.g. Request a project timeline update"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keyPoints">Key points</Label>
              <Textarea
                id="keyPoints"
                placeholder="One point per line…"
                rows={4}
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Friendly">Friendly</SelectItem>
                  <SelectItem value="Persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        }
        output={
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Generated subject will appear here"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                rows={24}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Generated email body will appear here"
                className="font-sans min-h-[400px]"
              />
            </div>
          </div>
        }
      />
    </div>
  );
}