<div align="center">

  <img src="./icon.png" alt="MCP Shark Viewer" width="128" height="128">

  <h1>MCP Shark Viewer (VS Code / Cursor)</h1>

  <p><strong>Inspect MCP traffic inside your IDE.</strong> Start/stop MCP Shark, open the inspector, and embed the MCP Shark UI in a webview.</p>

</div>

<p align="center">
  <img
    src="https://raw.githubusercontent.com/mcp-shark/mcp-shark-viewer-vscode/main/how-to.gif"
    alt="MCP Shark Viewer walkthrough"
  />
</p>

## Table of Contents

- [About](#about)
- [Features](#features)
- [Commands](#commands)
- [Getting Started](#getting-started)
- [Requirements](#requirements)
- [Install (VSIX)](#install-vsix)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Scripts](#scripts)
- [Docs](#docs)
- [Repo Layout](#repo-layout)
- [License](#license)

## About

This extension integrates **MCP Shark** into **VS Code / Cursor** (and other VS Code-compatible IDEs). It provides:

- A sidebar view (Activity Bar) to access the inspector quickly
- Commands to start/stop MCP Shark from the Command Palette
- An embedded MCP Shark UI panel (webview iframe)

MCP Shark (the server + UI) is the upstream project: [mcp-shark/mcp-shark](https://github.com/mcp-shark/mcp-shark/tree/main). For MCP Shark install/usage, see the upstream README: [README](https://github.com/mcp-shark/mcp-shark/blob/main/README.md).

## Features

- **Traffic Inspector View**: Activity Bar view `Traffic Inspector` (`mcp-shark-traffic`).
- **Embedded UI**: Webview panel that iframes the MCP Shark UI (`http://localhost:9853`).
- **Server lifecycle**: start/stop MCP Shark from inside the IDE.
- **Settings fetch**: when MCP Shark is reachable, the extension calls `GET /api/settings` (API reference: [GET /api/settings](https://github.com/mcp-shark/mcp-shark/blob/main/docs/api-reference.md#get-apisettings)).
- **Local LLM analysis**: Use the IDE's language model (VS Code / Cursor) for analysis. Run **MCP Shark: Run Local LLM Analysis** from the Command Palette, or call the extension's HTTP bridge (`POST http://127.0.0.1:9854/analyze` with JSON `{ "prompt", "context" }`) so MCP Shark or other tools can request analysis. Requires VS Code 1.108+ (or Cursor) with an available chat model (e.g. GitHub Copilot). Bridge can be disabled or its port changed in settings.

## Commands

| Command | Palette Title |
| --- | --- |
| `mcp-shark.viewer.startServer` | Start MCP Shark Server |
| `mcp-shark.viewer.stopServer` | Stop MCP Shark Server |
| `mcp-shark.viewer.openInspector` | Open Viewer |
| `mcp-shark.viewer.refresh` | Refresh |
| `mcp-shark.viewer.runLocalAnalysis` | Run Local LLM Analysis |

## Getting Started

1. Open the Activity Bar → **MCP Shark** → **Traffic Inspector**
2. Run **Start MCP Shark Server** (Command Palette)
3. Run **Open Viewer** to open the MCP Shark viewer panel
4. In the MCP Shark UI, go to **MCP Server Setup** and **start the MCP server** (select your IDE config / servers, then click **Start MCP Shark**)
5. For full MCP Shark first-run + setup instructions, see: [Getting Started](https://github.com/mcp-shark/mcp-shark/blob/main/docs/getting-started.md)
6. For MCP Shark install/CLI usage, see the upstream README: [mcp-shark/mcp-shark README](https://github.com/mcp-shark/mcp-shark/blob/main/README.md)

## Requirements

- **IDE**: VS Code / Cursor
- **Node.js**: required if you want the extension to auto-start MCP Shark via `npx -y @mcp-shark/mcp-shark` (MCP Shark requires Node 18+; see upstream README: [mcp-shark/mcp-shark README](https://github.com/mcp-shark/mcp-shark/blob/main/README.md))

## Install (VSIX)

Package:

```bash
vsce package
# or:
# npx @vscode/vsce package
```

Install into Cursor / VS Code:

```bash
cursor --install-extension mcp-shark-viewer-for-vscode-0.0.1.vsix
code --install-extension mcp-shark-viewer-for-vscode-0.0.1.vsix
```

See also: `docs/How.md`.

## Troubleshooting

- **UI opens but server isn’t “running”**: MCP Shark’s UI can be up even if an external MCP server failed to start. Open the MCP Shark UI and check the setup/logs (upstream docs: [mcp-shark/mcp-shark](https://github.com/mcp-shark/mcp-shark/tree/main)).
- **Port already in use (9853)**: another MCP Shark instance (or other process) is already bound to `9853`. Stop it and try again.
- **Start fails inside IDE**: ensure `npx` is available in the IDE environment and you can run `npx -y @mcp-shark/mcp-shark` in a terminal.

## Development

- Open this repo in VS Code/Cursor
- Press **F5** to launch an **Extension Development Host**
- Run:
  - `npm run validate`
  - `npm run lint`

## Scripts

- **validate**: `npm run validate` (runs `node scripts/validate.js`)
- **lint**: `npm run lint` (Biome)
- **format**: `npm run format`
- **check**: `npm run check`

## Docs

- **Install/Package**: `docs/How.md`
- **Validation workflow**: `docs/VALIDATION_PLAN.md`

## Repo Layout

- **Root entrypoint**: `extension.js` (thin shim exporting from `src/`)
- **Source**: `src/`
- **Validator**: `scripts/validate.js`
- **Docs**: `docs/`
- **Webview assets**: `media/` (e.g. `media/image.png`)

## License

See `LICENSE`.

