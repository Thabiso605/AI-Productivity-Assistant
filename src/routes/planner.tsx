import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
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

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Workplace AI" },
      {
        name: "description",
        content: "Turn your task list into a prioritized, time-blocked schedule.",
      },
      { property: "og:title", content: "AI Task Planner — Workplace AI" },
      {
        property: "og:description",
        content: "Turn your task list into a prioritized, time-blocked schedule.",
      },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const [tasks, setTasks] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [scope, setScope] = useState("Daily");
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState("");

  const run = async () => {
    if (!tasks.trim()) {
      toast.error("Please add at least one task");
      return;
    }
    setLoading(true);
    try {
      const result = await generateContent({
        data: { tool: "planner", payload: { tasks, startTime, endTime, scope } },
      });
      if (result.tool === "planner") setSchedule(result.text);
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    void navigator.clipboard.writeText(schedule);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="AI Task Planner"
        description="Prioritized time blocks built from your tasks and working hours."
      />
      <ToolShell
        title="Plan your time"
        description="List tasks (one per line, add deadlines if any)."
        icon={<CalendarClock className="h-5 w-5" />}
        onGenerate={run}
        onRegenerate={run}
        onCopy={copy}
        canCopy={schedule.length > 0}
        loading={loading}
        hasOutput={schedule.length > 0}
        inputs={
          <>
            <div className="space-y-2">
              <Label htmlFor="tasks">Tasks</Label>
              <Textarea
                id="tasks"
                rows={7}
                placeholder={"Finish Q3 report — due today\nReview design mockups\nEmail vendor about invoice"}
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start">Start</Label>
                <Input
                  id="start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End</Label>
                <Input
                  id="end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scope">Scope</Label>
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger id="scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        }
        output={
          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule</Label>
            <Textarea
              id="schedule"
              rows={20}
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="Your prioritized schedule will appear here"
              className="font-mono text-sm"
            />
          </div>
        }
      />
    </div>
  );
}