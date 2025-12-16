const vscode = require("vscode");

const { COMMAND_IDS, VIEW_ID_TRAFFIC } = require("../constants");
const { ensureMcpSharkRunning, isMcpSharkRunning, stopMcpSharkServer } = require("../mcp-shark");
const { createDatabasePanel } = require("../webview");
const { TrafficInspectorProvider } = require("../tree");

const checkMcpSharkStatus = async ({ provider }) => {
  const isRunning = await isMcpSharkRunning();
  if (provider) {
    await provider.updateServerStatus();
  }
  return isRunning;
};

const activate = (context) => {
  const trafficInspectorProvider = new TrafficInspectorProvider(context);
  const treeView = vscode.window.createTreeView(VIEW_ID_TRAFFIC, {
    treeDataProvider: trafficInspectorProvider,
    showCollapseAll: false,
    canSelectMany: false,
  });

  checkMcpSharkStatus({ provider: trafficInspectorProvider });

  const windowStateChangeDisposable = vscode.window.onDidChangeWindowState((e) => {
    if (e.focused) {
      setTimeout(() => {
        checkMcpSharkStatus({ provider: trafficInspectorProvider });
      }, 1000);
    }
  });

  treeView.onDidChangeVisibility((e) => {
    if (e.visible) {
      checkMcpSharkStatus({ provider: trafficInspectorProvider });
    }
  });

  const startServerDisposable = vscode.commands.registerCommand(COMMAND_IDS.startServer, async () => {
    await ensureMcpSharkRunning({ vscode });
    await trafficInspectorProvider.updateServerStatus();
  });

  const openInspectorDisposable = vscode.commands.registerCommand(
    COMMAND_IDS.openInspector,
    async () => {
      const isRunning = await isMcpSharkRunning();
      if (!isRunning) {
        vscode.window
          .showWarningMessage(
            "MCP Shark server is not running. Please start it first.",
            "Start Server"
          )
          .then((action) => {
            if (action === "Start Server") {
              vscode.commands.executeCommand(COMMAND_IDS.startServer);
            }
          });
        return;
      }

      await createDatabasePanel({ context, vscode });
    }
  );

  const refreshDisposable = vscode.commands.registerCommand(COMMAND_IDS.refresh, async () => {
    await trafficInspectorProvider.updateServerStatus();
  });

  const databasePanelDisposable = vscode.commands.registerCommand(
    COMMAND_IDS.showDatabasePanel,
    async () => {
      const isRunning = await isMcpSharkRunning();
      if (!isRunning) {
        vscode.window
          .showWarningMessage(
            "MCP Shark server is not running. Please start it first.",
            "Start Server"
          )
          .then((action) => {
            if (action === "Start Server") {
              vscode.commands.executeCommand(COMMAND_IDS.startServer);
            }
          });
        return;
      }

      await createDatabasePanel({ context, vscode });
    }
  );

  const stopServerDisposable = vscode.commands.registerCommand(COMMAND_IDS.stopServer, async () => {
    const isRunning = await isMcpSharkRunning();
    if (!isRunning) {
      vscode.window.showInformationMessage("MCP Shark server is not running.", "OK");
      return;
    }

    const result = await vscode.window.showWarningMessage(
      "Are you sure you want to stop the MCP Shark server?",
      { modal: true },
      "Yes",
      "No"
    );

    if (result === "Yes") {
      await stopMcpSharkServer({ vscode });
      await trafficInspectorProvider.updateServerStatus();
    }
  });

  context.subscriptions.push(
    treeView,
    startServerDisposable,
    openInspectorDisposable,
    refreshDisposable,
    databasePanelDisposable,
    stopServerDisposable,
    windowStateChangeDisposable
  );
};

module.exports = {
  activate,
};


