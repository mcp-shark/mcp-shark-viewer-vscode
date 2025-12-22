// Track the active panel globally so we can send output to it
// This is in a separate module to avoid circular dependencies
const activePanelState = {
  value: null,
};

const getActivePanel = () => activePanelState.value;

const setActivePanel = (panel) => {
  activePanelState.value = panel;
  if (panel) {
    // Clear panel reference when it's disposed
    panel.onDidDispose(() => {
      if (activePanelState.value === panel) {
        activePanelState.value = null;
      }
    });
  }
};

module.exports = {
  getActivePanel,
  setActivePanel,
};

