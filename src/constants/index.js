const MCP_SHARK_PORT = 9853;
const MCP_SHARK_BASE_URL = `http://localhost:${MCP_SHARK_PORT}`;

const MCP_SHARK_SETTINGS_URL = `${MCP_SHARK_BASE_URL}/api/settings`;

const VIEW_ID_TRAFFIC = "mcp-shark-traffic";

const COMMAND_IDS = {
  startServer: "mcp-shark.viewer.startServer",
  stopServer: "mcp-shark.viewer.stopServer",
  showDatabasePanel: "mcp-shark.viewer.showDatabasePanel",
  openInspector: "mcp-shark.viewer.openInspector",
  refresh: "mcp-shark.viewer.refresh",
};

module.exports = {
  MCP_SHARK_PORT,
  MCP_SHARK_BASE_URL,
  MCP_SHARK_SETTINGS_URL,
  VIEW_ID_TRAFFIC,
  COMMAND_IDS,
};


