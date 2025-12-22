const vscode = require("vscode");

const { COMMAND_IDS } = require("../constants");
const { isMcpSharkRunning } = require("../mcp-shark");

class TrafficInspectorProvider {
  constructor(context) {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.context = context;
    this.isServerRunning = false;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  async updateServerStatus() {
    this.isServerRunning = await isMcpSharkRunning();
    this.refresh();
  }

  getTreeItem(element) {
    if (!element || !element.label) {
      return new vscode.TreeItem("Loading...", vscode.TreeItemCollapsibleState.None);
    }

    const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);

    if (!this.isServerRunning && element.command !== COMMAND_IDS.startServer) {
      item.command = undefined;
      item.description = "Server not running";
    } else if (element.command) {
      item.command = { command: element.command, title: element.label };
    }

    const iconMap = {
      database: "database",
      graph: "graph",
      network: "radio-tower",
      refresh: "refresh",
      play: "play",
      "stop-circle": "stop-circle",
    };

    item.iconPath = element.icon
      ? new vscode.ThemeIcon(iconMap[element.icon] || element.icon)
      : new vscode.ThemeIcon("circle-outline");
    item.tooltip = element.tooltip || element.label;
    item.contextValue = element.contextValue || "trafficItem";
    return item;
  }

  getChildren(element) {
    if (element) {
      return [];
    }

    const items = [
      {
        label: "Start MCP Shark Server",
        command: COMMAND_IDS.startServer,
        icon: "play",
        tooltip: "Start the MCP Shark server",
        contextValue: "startServer",
      },
    ];

    if (this.isServerRunning) {
      items.push(
        {
          label: "Open Traffic Inspector",
          command: COMMAND_IDS.openInspector,
          icon: "network",
          tooltip: "Open the MCP Shark Traffic Inspector panel",
          contextValue: "openInspector",
        },
        {
          label: "Stop MCP Shark Server",
          command: COMMAND_IDS.stopServer,
          icon: "stop-circle",
          tooltip: "Stop the MCP Shark server",
          contextValue: "stopServer",
        }
      );
    } else {
      items.push(
        {
          label: "Open Traffic Inspector",
          command: COMMAND_IDS.openInspector,
          icon: "network",
          tooltip: "MCP Shark server must be running first",
          contextValue: "openInspectorDisabled",
        }
      );
    }

    return items;
  }
}

module.exports = {
  TrafficInspectorProvider,
};


