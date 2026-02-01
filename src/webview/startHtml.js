function getStartServerHtml({ message = null, imageUri = null, showOutput = false, output = "" } = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Shark - Start Server</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Monaco,Menlo,monospace&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-primary: #ffffff;
            --bg-secondary: #f8f9fa;
            --text-primary: #202124;
            --text-secondary: #5f6368;
            --accent-blue: #1a73e8;
            --button-primary: #4285f4;
            --button-primary-hover: #3367d6;
            --border-light: #dadce0;
            --error: #ea4335;
            --terminal-bg: #1e1e1e;
            --terminal-text: #d4d4d4;
            --terminal-stderr: #f48771;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Roboto', sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            display: flex;
            flex-direction: column;
            height: 100vh;
            margin: 0;
            padding: 0;
            overflow: hidden;
            -webkit-user-select: text;
            user-select: text;
        }
        
        .container {
            text-align: center;
            max-width: 500px;
            width: 100%;
            margin: 0 auto;
            padding: 20px;
            flex-shrink: 0;
        }
        
        .icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 24px;
            color: var(--accent-blue);
        }

        .hero {
            width: 180px;
            max-width: 70%;
            height: auto;
            display: block;
            margin: 0 auto 18px;
        }
        
        h1 {
            font-size: 24px;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 12px;
        }
        
        .message {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 32px;
            line-height: 1.6;
        }

        .output-container {
            display: ${showOutput ? "flex" : "none"};
            flex-direction: column;
            flex: 1;
            width: 100%;
            margin: 0;
            padding: 0 20px 20px 20px;
            min-height: 0;
            overflow: hidden;
        }

        .output-header {
            background: var(--terminal-bg);
            color: var(--terminal-text);
            padding: 12px 16px;
            font-size: 14px;
            font-weight: 500;
            border-radius: 4px 4px 0 0;
            flex-shrink: 0;
            font-family: 'Monaco', 'Menlo', monospace;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .output-terminal {
            background: var(--terminal-bg);
            color: var(--terminal-text);
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 12px;
            line-height: 1.5;
            padding: 16px;
            border-radius: 0 0 4px 4px;
            flex: 1;
            overflow-y: auto;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            min-height: 0;
            -webkit-user-select: text;
            user-select: text;
        }

        .output-terminal .stderr {
            color: var(--terminal-stderr);
        }

        .output-terminal .stdout {
            color: var(--terminal-text);
        }
    </style>
</head>
<body>
    <div class="container">
        ${imageUri ? `<img class="hero" src="${imageUri}" alt="MCP Shark" />` : ""}
        <h1>MCP Shark Server Not Running</h1>
        <p class="message">
            ${
              message ||
              "The MCP Shark server needs to be running to view traffic data. Please use the 'Start MCP Shark Server' button in the panel."
            }
        </p>
    </div>
    <div class="output-container">
        <div class="output-header">Server Logs</div>
        <div class="output-terminal" id="output">${output}</div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const outputEl = document.getElementById('output');

        // Listen for server output messages
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'serverOutput') {
                const line = message.line || '';
                const type = message.type || 'stdout';
                const span = document.createElement('span');
                span.className = type;
                span.textContent = line;
                outputEl.appendChild(span);
                // Auto-scroll to bottom
                outputEl.scrollTop = outputEl.scrollHeight;
            }
        });
    </script>
</body>
</html>`;
}

module.exports = {
  getStartServerHtml,
};


