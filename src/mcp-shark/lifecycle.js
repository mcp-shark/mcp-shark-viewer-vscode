const { spawn, exec } = require("node:child_process");
const os = require("node:os");

const { MCP_SHARK_BASE_URL, MCP_SHARK_PORT } = require("../constants");
const { httpGetStatusCode } = require("./http");
const { createMcpSharkSettingsCache, fetchMcpSharkSettings } = require("./settings");

const settingsCache = createMcpSharkSettingsCache();

const isMcpSharkRunning = async () => {
  const status = await httpGetStatusCode(`${MCP_SHARK_BASE_URL}/api/settings`, {
    timeoutMs: 1000,
  });

  if (status === 200) {
    return true;
  }

  return false;
};

const ensureMcpSharkRunning = async ({ vscode }) => {
  const isRunning = await isMcpSharkRunning();
  if (isRunning) {
    try {
      await fetchMcpSharkSettings({ cache: settingsCache });
    } catch (_error) {
      // Best-effort: settings fetch is useful, but not required to consider the server "running".
    }
    return true;
  }

  const startMessage = vscode.window.showInformationMessage(
    "MCP Shark server is not running. Start it now?",
    "Yes",
    "No"
  );

  const result = await startMessage;
  if (result !== "Yes") {
    return false;
  }

  return new Promise((resolve) => {
    const child = spawn("npx", ["-y", "@mcp-shark/mcp-shark"], {
      detached: true,
      stdio: "ignore",
      shell: true,
    });

    child.unref();

    setTimeout(() => {
      const state = { attempts: 0 };
      const maxAttempts = 30;

      const checkInterval = setInterval(async () => {
        state.attempts += 1;

        const running = await isMcpSharkRunning();
        if (running) {
          clearInterval(checkInterval);

          try {
            await fetchMcpSharkSettings({ cache: settingsCache });
          } catch (_error) {
            // Best-effort.
          }

          vscode.window.showInformationMessage("MCP Shark server started successfully!", "OK");
          resolve(true);
          return;
        }

        if (state.attempts >= maxAttempts) {
          clearInterval(checkInterval);
          vscode.window.showWarningMessage(
            "MCP Shark server may not have started. Please start it manually with: npx -y @mcp-shark/mcp-shark",
            "OK"
          );
          resolve(false);
        }
      }, 1000);
    }, 2000);
  });
};

const stopMcpSharkServer = async ({ vscode }) => {
  return new Promise((resolve) => {
    const platform = os.platform();
    const command =
      platform === "win32"
        ? `for /f "tokens=5" %a in ('netstat -aon ^| findstr :${MCP_SHARK_PORT}') do taskkill /PID %a /T`
        : `pids=$(lsof -ti:${MCP_SHARK_PORT} 2>/dev/null); if [ -n "$pids" ]; then kill -TERM $pids 2>/dev/null || true; fi`;

    exec(command, (error) => {
      if (error) {
        // Process might not be running; treat as best-effort.
        console.log("MCP Shark server stop attempt:", error.message);
      }

      setTimeout(async () => {
        const isRunning = await isMcpSharkRunning();
        if (!isRunning) {
          vscode.window.showInformationMessage("MCP Shark server stopped successfully.", "OK");
          resolve(true);
          return;
        }

        vscode.window.showWarningMessage(
          "MCP Shark server may still be running. Please stop it manually.",
          "OK"
        );
        resolve(false);
      }, 1000);
    });
  });
};

const getCachedMcpSharkSettings = () => {
  return {
    value: settingsCache.value,
    fetchedAtMs: settingsCache.fetchedAtMs,
  };
};

module.exports = {
  ensureMcpSharkRunning,
  getCachedMcpSharkSettings,
  isMcpSharkRunning,
  stopMcpSharkServer,
};


