# Changelog

All notable changes to the MCP Shark Viewer extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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

