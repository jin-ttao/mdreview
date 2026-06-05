# mdreview

Terminal-first Markdown review loop for agent-written docs.

`mdreview` opens a local Markdown file in a lightweight browser preview, lets you attach comments to selected text, and copies an agent-ready review prompt for Claude Code, Codex, or any other coding agent.

## Why

Coding agents are good at producing specs, PRDs, architecture notes, and review boards. The awkward part is reviewing those docs precisely and handing feedback back to the agent without switching into a full editor or document system.

`mdreview` focuses only on that loop:

1. Open local Markdown from the terminal.
2. Read it in a clean browser preview.
3. Select text and add anchored feedback.
4. Copy the accumulated review packet.
5. Paste it back into your agent session.

## Usage

Install the local CLI while developing:

```bash
npm link
```

Then open a Markdown file:

```bash
mdreview docs/specs/example.md
```

You can also pass a filename or slug. The CLI searches the current working directory and `~/Desktop/home/code`.

```bash
mdreview scan-observability
```

Without linking, run it directly:

```bash
node bin/mdreview.js docs/specs/example.md
```

## Features

- Localhost browser preview
- One-column and two-column page layout toggle
- Zoom controls
- Selection-based comments
- Block-level Markdown line anchors
- Right-side review panel
- Copy-for-agent prompt generation
- Browser `localStorage` persistence per file

## Non-goals

- Markdown editing
- Cloud sync
- Login/accounts
- Multi-user collaboration
- Direct Claude Code/Codex session injection
- GitHub PR review replacement

## Prototype Status

This is an early local MVP. Pagination is currently approximate: Markdown blocks are grouped into page cards by weight, then displayed in one or two columns.

## Agent Instruction Snippet

See [docs/agent-instructions.md](docs/agent-instructions.md) for a short instruction you can add to Codex, Claude Code, or project-level agent docs.
