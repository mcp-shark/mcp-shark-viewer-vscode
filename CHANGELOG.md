# Changelog

All notable changes to the MCP Shark Viewer extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Local LLM analysis**: Use the IDE's language model (VS Code / Cursor) for local analysis. Run **MCP Shark: Run Local LLM Analysis** from the Command Palette, or have MCP Shark call the extension via the HTTP bridge.
- **LLM bridge server**: Optional HTTP server (default port 9854) that accepts `POST /analyze` with JSON `{ "prompt", "context" }` so MCP Shark or other tools can request analysis using the IDE's LLM. Enable/disable and port via settings `mcpShark.localAnalysis.bridgeEnabled` and `mcpShark.localAnalysis.bridgePort`.
- **Webview bridge**: The embedded MCP Shark UI (iframe) can request analysis by posting `{ type: 'mcp-shark-viewer/requestLlmAnalysis', prompt, context }` to the parent; the extension runs the LLM and posts back `{ type: 'mcp-shark-viewer/requestLlmAnalysisResult', result, error }`.
- Iframe URL now includes `?embed=vscode-viewer` so the MCP Shark UI can show extension-only UI (e.g. "Running in VS Code / Cursor" bar and "Analyze with IDE LLM").
- Automatic routing to setup page (`/setup`) if MCP server is not configured
- Automatic routing to traffic page (`/traffic`) if MCP server is ready
- Server output display in webview HTML terminal with real-time stdio capture
- Terminal-style output header with dark theme matching the terminal
- How-to GIF in README for better user onboarding
- Support for checking MCP server status via `/api/mcp-server/status` endpoint

### Changed
- Server startup now uses `@latest` tag to ensure latest package version
- Output header styling changed from blue to terminal dark theme
- Improved webview layout to show original white page with logo and separate output section

### Fixed
- Resolved circular dependency by extracting panel state to separate module
- Fixed `isMcpSharkRunning is not a function` error
- Fixed server output not visible when starting from tree view
- Fixed setup status check to parse JSON response correctly
- Fixed linting issues (forEach → for...of, template literals)

### Removed
- Removed unnecessary "View Statistics" section from tree view
- Removed unused `showDatabasePanel` command and related menu items
- Removed unused graph icon from iconMap

### Refactored
- Code compliance with coding rules (const instead of let, removed console.log)
- Improved code quality with proper error handling and async patterns

## [1.0.4] - 2024-12-17

### Added
- Initial release with basic MCP Shark integration
- Traffic Inspector view in Activity Bar
- Commands to start/stop MCP Shark server
- Embedded MCP Shark UI panel (webview iframe)
- Settings fetch from MCP Shark API

[Unreleased]: https://github.com/mcp-shark/mcp-shark-viewer-vscode/compare/v1.0.4...HEAD
[1.0.4]: https://github.com/mcp-shark/mcp-shark-viewer-vscode/releases/tag/v1.0.4

