# Notion

An independent Notion-style workspace built with plain HTML, CSS, and JavaScript. Write pages, organize projects, and work with browser agents through a structured action API.

[Open the hosted workspace](https://notion-workspace-studio-nt46.yashasvm1.chatgpt.site)

The hosted workspace is private. This public source repository does not change who can access that deployment.

## Run locally

Clone this repository and serve its `dist` directory:

```sh
git clone https://github.com/YashasVM/notion.git
cd notion
python3 -m http.server 8000 --directory dist
```

Open <http://localhost:8000>. There is no application build step or runtime package dependency. A stable HTTP origin is recommended because workspace data belongs to the browser and origin where it was created.

For development checks:

```sh
npm install
npm run check
npm test
```

## Features

- Editable pages, headings, lists, checklists, toggles, callouts, quotes, and code blocks
- Slash commands, inline formatting, templates, search, favorites, and nested pages
- Project databases with table, board, calendar, and list views
- Task editing, filtering, sorting, board drag and drop, and CSV export
- Page comments, trash recovery, snapshots, Markdown export, and workspace backups
- Light and dark themes, locally bundled Inter, Source Serif 4, and JetBrains Mono
- Subtle interface transitions that respect reduced-motion preferences
- Agent actions and optional WebMCP registration for supported browsers

The homepage shows saved pages and actual task records. New workspaces start with Workspace, Project tracker, and Getting started, with no demo tasks or fake collaborators. Existing saved content is preserved.

Pages and tasks save in browser storage. There is no cloud synchronization, live collaboration, or connected AI backend. Use **Settings → Export backup** to download a copy of your workspace.

## Work with an agent

When the app is open, agents can discover available actions and invoke them without relying on screen coordinates:

```js
const actions = window.NotionAgent.tools;
const pages = await window.NotionAgent.execute('notion_list_pages', {
  query: 'design'
});
```

The same actions register with `document.modelContext` when the browser supports the WebMCP imperative registration API. The regular interface and `window.NotionAgent` remain usable without WebMCP.

See [the agent API](docs/AGENT_API.md) for schemas and examples, and [AGENTS.md](AGENTS.md) for repository guidance.

## Source map

| Path | Purpose |
| --- | --- |
| `dist/index.html` | Application entry point |
| `dist/app.js` | Workspace shell and page state |
| `dist/editor.js` | Block editor and formatting |
| `dist/database.js` | Project database views and task state |
| `dist/agent.js` | Agent action discovery, validation, and WebMCP registration |
| `dist/style.css`, `dist/polish.css` | Shared layout, typography, and theme-safe interaction states |
| `dist/motion.css`, `dist/motion.js` | Reduced-motion-aware interaction transitions |
| `dist/fonts.css`, `dist/fonts/` | Bundled fonts and their licenses |
| `docs/AGENT_API.md` | Browser agent integration |
| `.openai/hosting.json` | Existing Sites deployment configuration |

Application source lives directly in `dist` and is not minified. Serve that folder with any static HTTP host. Existing deployment configuration identifies the current hosted Site; use your own hosting configuration for a separate deployment.

## Credits

This project is not affiliated with or endorsed by Notion. Font license notices are included in `dist/fonts`. The cover photograph is from [Unsplash](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b), downloaded from image asset `photo-1464822759023-fed622ff2c3b`.
