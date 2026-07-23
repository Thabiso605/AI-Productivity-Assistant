import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Mail, CalendarClock, BookOpen, ArrowRight, Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { AIDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Workplace AI" },
      {
        name: "description",
        content:
          "Your AI productivity dashboard. Draft emails, plan your day, and research topics in seconds.",
      },
      { property: "og:title", content: "Dashboard — Workplace AI" },
      {
        property: "og:description",
        content: "Draft emails, plan your day, and research topics in seconds.",
      },
    ],
  }),
  component: Index,
});

const tools = [
  {
    title: "Smart Email Generator",
    description: "Draft professional emails with the right tone in seconds.",
    href: "/email" as const,
    icon: Mail,
  },
  {
    title: "AI Task Planner",
    description: "Turn your task list into a prioritized, time-blocked schedule.",
    href: "/planner" as const,
    icon: CalendarClock,
  },
  {
    title: "AI Research Assistant",
    description: "Summarize articles and surface key insights and next steps.",
    href: "/research" as const,
    icon: BookOpen,
  },
];

function Index() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary w-fit">
        <Sparkles className="h-3.5 w-3.5" />
        Powered by Lovable AI
      </div>
      <PageHeader
        title="Welcome to your AI workplace"
        description="Pick a tool to get started. Everything stays in this browser session."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.href} to={tool.href} className="group">
            <Card className="h-full rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <CardHeader>
                <div className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <tool.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm font-medium text-primary">
                  Open tool
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <AIDisclaimer />
      </div>
    </div>
  );
}
