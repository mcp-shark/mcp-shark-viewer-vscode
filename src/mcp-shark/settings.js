const { MCP_SHARK_SETTINGS_URL } = require("../constants");
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

module.exports = {
  createMcpSharkSettingsCache,
  fetchMcpSharkSettings,
};


