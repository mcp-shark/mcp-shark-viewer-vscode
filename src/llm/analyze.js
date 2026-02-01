function isModelNotSupportedError(err) {
  const msg = err?.message || "";
  const code = err?.code || err?.error?.code || err?.param;
  return (
    code === "model_not_supported" ||
    msg.includes("model is not supported") ||
    msg.includes("model_not_supported")
  );
}

/**
 * Run local LLM analysis using the IDE's language model (VS Code / Cursor).
 * Uses vscode.lm (Language Model API) when available.
 * @param {object} options
 * @param {import('vscode')} options.vscode - VS Code API
 * @param {string} options.prompt - User prompt / question for analysis
 * @param {string} [options.context] - Optional context (e.g. MCP traffic summary) to include
 * @param {import('vscode').CancellationToken} [options.token] - Optional cancellation token
 * @returns {Promise<{ result: string } | { error: string }>}
 */
async function requestLlmAnalysis({ vscode, prompt, context = "", token }) {
  if (!vscode?.lm?.selectChatModels) {
    return {
      error: "Language Model API is not available. Use VS Code 1.108+ or Cursor with an available chat model.",
    };
  }

  const config = vscode.workspace.getConfiguration("mcpShark");
  const vendorFilter = (config.get("localAnalysis.modelVendor") || "").trim();
  const selectOptions = vendorFilter ? { vendor: vendorFilter } : {};

  let models = await vscode.lm.selectChatModels(selectOptions);
  if (!models || models.length === 0) {
    if (vendorFilter) {
      models = await vscode.lm.selectChatModels({});
    }
    if (!models || models.length === 0) {
      return {
        error:
          "No language model is available. Sign in to GitHub Copilot or ensure a chat model is enabled in your IDE.",
      };
    }
  }

  const systemInstruction =
    "You are helping analyze MCP (Model Context Protocol) traffic and tool usage. Be concise and focus on security, correctness, and clarity.";
  const userContent = context
    ? `Context:\n${context}\n\nRequest:\n${prompt}`
    : prompt;

  const messages = [
    vscode.LanguageModelChatMessage.User(systemInstruction),
    vscode.LanguageModelChatMessage.User(userContent),
  ];

  const cancelToken = token || new vscode.CancellationTokenSource().token;

  let lastError = null;
  for (const model of models) {
    try {
      const chatResponse = await model.sendRequest(messages, {}, cancelToken);
      let result = "";
      for await (const fragment of chatResponse.text) {
        result += fragment;
      }
      return { result: result.trim() || "(No response)" };
    } catch (err) {
      lastError = err;
      if (isModelNotSupportedError(err)) {
        continue;
      }
      break;
    }
  }

  if (lastError?.name === "LanguageModelError" || lastError?.code) {
    return {
      error: lastError.message || "Language model request failed.",
    };
  }
  return {
    error:
      lastError instanceof Error ? lastError.message : String(lastError),
  };
}

module.exports = {
  requestLlmAnalysis,
};
