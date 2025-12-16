## Package + install (from repo root)

### Prereqs

- **Node.js** (for `npm` / `npx`)
- **vsce** (VS Code Extension Manager)
  - Either install globally: `npm i -g @vscode/vsce`
  - Or use it via `npx` (no global install)

### 1) Validate

From the repo root:

```bash
npm run validate
```

### 2) Package (creates a `.vsix`)

From the repo root:

```bash
vsce package
# or (no global install):
# npx @vscode/vsce package
```

This repo’s `.vsix` name is based on `package.json`:
- **name**: `mcp-shark-viewer-for-vscode`
- **version**: `0.0.1`

So the packaged file will be:
- `mcp-shark-viewer-for-vscode-0.0.1.vsix`

### 3) Install into your IDE

```bash
cursor --install-extension mcp-shark-viewer-for-vscode-0.0.1.vsix
code --install-extension mcp-shark-viewer-for-vscode-0.0.1.vsix
```

Then reload/restart the IDE window.