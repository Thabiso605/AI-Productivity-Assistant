import type { ReactNode } from "react";
import { Copy, RotateCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AIDisclaimer } from "@/components/ai-disclaimer";

type ToolShellProps = {
  title: string;
  description: string;
  icon: ReactNode;
  inputs: ReactNode;
  output: ReactNode;
  onGenerate: () => void;
  onRegenerate: () => void;
  onCopy: () => void;
  canCopy: boolean;
  loading: boolean;
  hasOutput: boolean;
};

export function ToolShell({
  title,
  description,
  icon,
  inputs,
  output,
  onGenerate,
  onRegenerate,
  onCopy,
  canCopy,
  loading,
  hasOutput,
}: ToolShellProps) {
  const handleCopy = () => {
    onCopy();
    toast.success("Copied to clipboard");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
              {icon}
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {inputs}
          <Button onClick={onGenerate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : hasOutput ? (
              "Generate again"
            ) : (
              "Generate"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Output</CardTitle>
            <CardDescription>Editable — refine before using</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!canCopy}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={loading || !hasOutput}
            >
              <RotateCw className="mr-1.5 h-3.5 w-3.5" />
              Regenerate
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {output}
          <AIDisclaimer />
        </CardContent>
      </Card>
    </div>
  );
}