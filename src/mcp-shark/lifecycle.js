const { spawn, exec } = require("node:child_process");
const os = require("node:os");

const { MCP_SHARK_BASE_URL, MCP_SHARK_PORT } = require("../constants");
const { httpGetStatusCode } = require("./http");
const { createMcpSharkSettingsCache, fetchMcpSharkSettings } = require("./settings");
const { getActivePanel } = require("../webview/panelState");

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

const ensureMcpSharkRunning = async ({ vscode, webviewPanel = null }) => {
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

  // If webview panel is provided, or get active panel, send output to it
  const sendOutput = (line, type = "stdout") => {
    const panel = webviewPanel || getActivePanel();
    if (panel) {
      try {
        panel.webview.postMessage({
          command: "serverOutput",
          line,
          type,
        });
      } catch (_error) {
        // Panel might be disposed, ignore
      }
    }
  };

  // Spawn the process and capture stdout/stderr
  const child = spawn("npx", ["-y", "@mcp-shark/mcp-shark"], {
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  // Send initial message
  sendOutput("Starting MCP Shark server...\n", "stdout");
  sendOutput("Running: npx -y @mcp-shark/mcp-shark\n", "stdout");

  // Capture stdout
  child.stdout.on("data", (data) => {
    const lines = data.toString().split("\n").filter((line) => line.trim());
    for (const line of lines) {
      sendOutput(`${line}\n`, "stdout");
    }
  });

  // Capture stderr
  child.stderr.on("data", (data) => {
    const lines = data.toString().split("\n").filter((line) => line.trim());
    for (const line of lines) {
      sendOutput(`${line}\n`, "stderr");
    }
  });

  // Handle process exit
  child.on("exit", (code) => {
    if (code === 0) {
      sendOutput("\n✓ Server process exited normally\n", "stdout");
    } else {
      sendOutput(`\n✗ Server process exited with code ${code}\n`, "stderr");
    }
  });

  child.on("error", (error) => {
    sendOutput(`\n✗ Error starting server: ${error.message}\n`, "stderr");
  });

  // Poll for server readiness
  return new Promise((resolve) => {
    setTimeout(() => {
      const state = { attempts: 0 };
      const maxAttempts = 30;

      const checkInterval = setInterval(async () => {
        state.attempts += 1;

        const running = await isMcpSharkRunning();
        if (running) {
          clearInterval(checkInterval);
          sendOutput("\n✓ MCP Shark server is now running!\n", "stdout");

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
          sendOutput("\n⚠ Server may not have started. Please check the output above for errors.\n", "stderr");
          vscode.window.showWarningMessage(
            "MCP Shark server may not have started. Please check the output for errors.",
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

    exec(command, (_error) => {
      // Process might not be running; treat as best-effort.

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


