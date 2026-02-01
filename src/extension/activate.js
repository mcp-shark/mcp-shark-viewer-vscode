const vscode = require("vscode");

const { COMMAND_IDS, VIEW_ID_TRAFFIC } = require("../constants");
const { requestLlmAnalysis, startLlmBridgeServer, stopLlmBridgeServer } = require("../llm");
const { ensureMcpSharkRunning, isMcpSharkRunning, stopMcpSharkServer } = require("../mcp-shark");
const { createDatabasePanel, getStartServerHtml } = require("../webview");
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
    // Open/create the panel first so output can be shown
    const panel = await createDatabasePanel({ context, vscode });
    
    // If panel already exists and server is running, just update status
    const isRunning = await isMcpSharkRunning();
    if (isRunning) {
      await trafficInspectorProvider.updateServerStatus();
      return;
    }
    
    // Update panel to show output area
    const mediaRoot = vscode.Uri.joinPath(context.extensionUri, "media");
    const imageUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(mediaRoot, "image.png"));
    panel.webview.html = getStartServerHtml({ 
      imageUri, 
      showOutput: true,
      output: "Starting server...\n"
    });
    
    // Reveal the panel so user can see the output
    panel.reveal();
    
    await ensureMcpSharkRunning({ vscode, webviewPanel: panel });
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

  const runLocalAnalysisDisposable = vscode.commands.registerCommand(
    COMMAND_IDS.runLocalAnalysis,
    async () => {
      const prompt = await vscode.window.showInputBox({
        title: "MCP Shark: Local LLM Analysis",
        prompt: "Enter what you want the IDE's language model to analyze (e.g. MCP traffic summary, tool usage).",
        placeHolder: "Summarize or analyze the MCP traffic...",
      });
      if (prompt == null || prompt.trim() === "") {
        return;
      }
      const editor = vscode.window.activeTextEditor;
      const contextText = editor?.document
        ? editor.document.getText(editor.selection) || editor.document.getText()
        : "";
      const channel = vscode.window.createOutputChannel("MCP Shark (Local Analysis)");
      channel.clear();
      channel.appendLine("Running local analysis with IDE language model...");
      const outcome = await requestLlmAnalysis({
        vscode,
        prompt: prompt.trim(),
        context: contextText.slice(0, 32000),
      });
      if (outcome.error) {
        channel.appendLine(`Error: ${outcome.error}`);
        channel.show(true);
        return;
      }
      channel.appendLine(outcome.result);
      channel.show(true);
    }
  );

  const llmBridge = startLlmBridgeServer({ vscode });
  if (llmBridge) {
    context.subscriptions.push({
      dispose: () => stopLlmBridgeServer(llmBridge.server),
    });
  }

  context.subscriptions.push(
    treeView,
    startServerDisposable,
    openInspectorDisposable,
    refreshDisposable,
    stopServerDisposable,
    runLocalAnalysisDisposable,
    windowStateChangeDisposable
  );
};

module.exports = {
  activate,
};


