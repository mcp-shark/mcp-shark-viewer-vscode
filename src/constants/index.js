const MCP_SHARK_PORT = 9853;
const MCP_SHARK_BASE_URL = `http://localhost:${MCP_SHARK_PORT}`;

const MCP_SHARK_SETTINGS_URL = `${MCP_SHARK_BASE_URL}/api/settings`;
const MCP_SHARK_SERVER_STATUS_URL = `${MCP_SHARK_BASE_URL}/api/mcp-server/status`;

const VIEW_ID_TRAFFIC = "mcp-shark-traffic";

const MCP_SHARK_LLM_BRIDGE_PORT_DEFAULT = 9854;

const COMMAND_IDS = {
  startServer: "mcp-shark.viewer.startServer",
  stopServer: "mcp-shark.viewer.stopServer",
  openInspector: "mcp-shark.viewer.openInspector",
  refresh: "mcp-shark.viewer.refresh",
  runLocalAnalysis: "mcp-shark.viewer.runLocalAnalysis",
};

module.exports = {
  MCP_SHARK_PORT,
  MCP_SHARK_BASE_URL,
  MCP_SHARK_SETTINGS_URL,
  MCP_SHARK_SERVER_STATUS_URL,
  MCP_SHARK_LLM_BRIDGE_PORT_DEFAULT,
  VIEW_ID_TRAFFIC,
  COMMAND_IDS,
};


