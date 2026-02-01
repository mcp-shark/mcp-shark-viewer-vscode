const http = require("node:http");
const { MCP_SHARK_LLM_BRIDGE_PORT_DEFAULT } = require("../constants");
const { requestLlmAnalysis } = require("./analyze");

const ALLOW_ORIGIN = "*";

/**
 * Create and start the LLM bridge HTTP server so MCP Shark (or other tools) can
 * request local analysis via the IDE's language model.
 * @param {object} options
 * @param {import('vscode')} options.vscode - VS Code API
 * @param {number} [options.port] - Port to listen on (default from settings)
 * @returns {{ server: import('http').Server; port: number } | null} Server and port, or null if not started
 */
function startLlmBridgeServer({ vscode, port: requestedPort }) {
  const config = vscode?.workspace?.getConfiguration?.("mcpShark") ?? {};
  const enabled = config.get?.("localAnalysis.bridgeEnabled") !== false;
  if (!enabled) {
    return null;
  }

  const port =
    requestedPort ??
    config.get?.("localAnalysis.bridgePort") ??
    MCP_SHARK_LLM_BRIDGE_PORT_DEFAULT;

  const server = http.createServer(async (req, res) => {
    const cors = () => {
      res.setHeader("Access-Control-Allow-Origin", ALLOW_ORIGIN);
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    };

    if (req.method === "OPTIONS") {
      cors();
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method !== "POST" || req.url !== "/analyze") {
      cors();
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found. Use POST /analyze" }));
      return;
    }

    let body = "";
    req.setEncoding("utf8");
    for await (const chunk of req) {
      body += chunk;
    }

    let payload;
    try {
      payload = JSON.parse(body || "{}");
    } catch (_e) {
      cors();
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON body" }));
      return;
    }

    const prompt = typeof payload.prompt === "string" ? payload.prompt : "";
    const context = typeof payload.context === "string" ? payload.context : "";

    if (!prompt.trim()) {
      cors();
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing or empty 'prompt' in body" }));
      return;
    }

    const outcome = await requestLlmAnalysis({
      vscode,
      prompt: prompt.trim(),
      context,
    });

    cors();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(outcome));
  });

  try {
    server.listen(port, "127.0.0.1", () => {});
  } catch (err) {
    return null;
  }

  return { server, port };
}

/**
 * Stop the LLM bridge server.
 * @param {import('http').Server} server
 */
function stopLlmBridgeServer(server) {
  if (server) {
    try {
      server.close();
    } catch (_e) {
      // ignore
    }
  }
}

module.exports = {
  startLlmBridgeServer,
  stopLlmBridgeServer,
};
