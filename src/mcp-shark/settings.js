const { MCP_SHARK_SETTINGS_URL, MCP_SHARK_SERVER_STATUS_URL } = require("../constants");
const { httpGetJson } = require("./http");

const createMcpSharkSettingsCache = () => {
  return {
    value: null,
    fetchedAtMs: 0,
  };
};

const fetchMcpSharkSettings = async ({ cache } = {}) => {
  const settings = await httpGetJson(MCP_SHARK_SETTINGS_URL, { timeoutMs: 2000 });

  if (cache) {
    cache.value = settings;
    cache.fetchedAtMs = Date.now();
  }

  return settings;
};

const isMcpSharkSetupComplete = async () => {
  try {
    // Check if MCP server is ready to receive traffic
    const response = await httpGetJson(MCP_SHARK_SERVER_STATUS_URL, {
      timeoutMs: 2000,
    });
    // Response format: { "running": true, "message": "..." }
    // If running is true, server is ready to receive traffic (setup is complete)
    return response.running === true;
  } catch (_error) {
    // If we can't reach the endpoint, assume setup is not complete
    return false;
  }
};

module.exports = {
  createMcpSharkSettingsCache,
  fetchMcpSharkSettings,
  isMcpSharkSetupComplete,
};


