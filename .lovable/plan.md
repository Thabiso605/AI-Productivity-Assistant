
## Overview

A frontend-only SaaS dashboard with three AI tools. No auth, no database, no history — state lives only in the current browser session (React state). AI calls go through Lovable AI Gateway via a TanStack Start server function (the only "backend" piece, required to keep the API key server-side).

## Design direction

- Clean modern SaaS aesthetic, blue + white professional palette
- Left sidebar navigation (collapsible on mobile via shadcn Sidebar)
- Top header with app title and a subtle theme accent
- Rounded cards with soft shadows, generous spacing
- Responsive: sidebar collapses to icon/offcanvas on mobile

Design tokens updated in `src/styles.css`: professional blue primary (oklch), neutral surfaces, refined shadow tokens.

## Routes

```
/                → Dashboard landing (overview + quick links to the 3 tools)
/email           → Smart Email Generator
/planner         → AI Task Planner
/research        → AI Research Assistant
```

Shared layout (sidebar + header + disclaimer footer) lives in `src/routes/__root.tsx` around `<Outlet />`. `/` replaces the placeholder index.

## Features (all three follow the same pattern)

Each tool page:
1. Input form (left or top on mobile) with the fields listed below
2. Generate button → calls the shared server function with a structured prompt
3. Output area: editable `<Textarea>` prefilled with AI response, plus **Copy** and **Regenerate** buttons
4. Loading + error states, disclaimer visible

### 1. Smart Email Generator (`/email`)
- Inputs: Recipient, Purpose, Key points (textarea), Tone (Formal / Friendly / Persuasive select)
- Output: Subject line (editable input) + Body (editable textarea)

### 2. AI Task Planner (`/planner`)
- Inputs: Tasks (textarea, one per line with optional deadlines), Working hours (start/end time), Scope (Daily / Weekly)
- Output: Prioritized schedule with time blocks (editable textarea, markdown-friendly)

### 3. AI Research Assistant (`/research`)
- Inputs: Topic OR pasted article (textarea)
- Output: Three editable sections — Summary, Key Insights, Recommendations

## AI integration

Single server function `generateContent` in `src/lib/ai.functions.ts` using AI SDK + Lovable AI Gateway (`google/gemini-2.5-flash` default per catalog). Client passes `{ tool, inputs }`; the server builds a structured prompt:

```
Goal: <per-tool goal>
Context: <per-tool context>
User Input: <serialized inputs>
Instructions: <per-tool instructions + tone/format rules>
Output Format: <per-tool expected format>
```

For Email and Research (multi-field outputs) the server function uses `generateText` with `Output.object` (small schema, no bounds) to return structured JSON. Planner returns plain text.

`LOVABLE_API_KEY` stays server-side, read inside the handler. If missing, provisioned via `lovable_api_key--create` during build.

## Shared UI pieces

- `AppSidebar` — shadcn sidebar with links to the 3 tools + Dashboard, active-route highlighting
- `ToolShell` — reusable card wrapper (title, description, input slot, output slot, Copy/Regenerate)
- `AIDisclaimer` — persistent banner in footer/bottom of every tool page: *"AI-generated content may contain errors. Always review outputs before using them professionally."*
- Sonner toasts for Copy success / errors

## Files to add / change

- `src/routes/__root.tsx` — add SidebarProvider layout + header + disclaimer
- `src/routes/index.tsx` — replace placeholder with dashboard landing (3 feature cards)
- `src/routes/email.tsx`, `src/routes/planner.tsx`, `src/routes/research.tsx` — tool pages, each with unique `head()` metadata
- `src/components/app-sidebar.tsx`
- `src/components/tool-shell.tsx`
- `src/components/ai-disclaimer.tsx`
- `src/lib/ai.functions.ts` — server function calling the gateway
- `src/styles.css` — refine blue/white token palette

## Explicitly excluded (per request)

No DB, no auth, no history persistence, no file uploads, no analytics, no user profiles.
