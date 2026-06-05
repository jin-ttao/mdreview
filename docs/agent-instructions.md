# Agent Instructions for mdreview

Use this snippet in Codex, Claude Code, or a project-level agent instruction file.

```md
When the user asks to open, inspect, preview, or review a local Markdown document, use `mdreview`.

Preferred command:

mdreview <path-or-query>

Use it for agent-written specs, PRDs, architecture docs, implementation plans, review boards, and migration notes.

Behavior:
- If the user gives an exact Markdown path, run `mdreview <path>`.
- If the user gives only a filename, slug, or document name, run `mdreview <query>`.
- After opening mdreview, do not edit the document until the user pastes back the copied review prompt.
- When the user pastes a review prompt from mdreview, apply the requested changes to the referenced file.
- Preserve the current document structure unless the review prompt explicitly asks for restructuring.
```

Minimal version:

```md
For local Markdown review requests, run `mdreview <path-or-query>`. Wait for the user to paste back the copied review prompt before editing.
```
