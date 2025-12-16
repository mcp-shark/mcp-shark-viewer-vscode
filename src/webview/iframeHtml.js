const { MCP_SHARK_BASE_URL } = require("../constants");

function getMcpSharkIframeHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Shark</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #ffffff;
        }
        .container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        .status-bar {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 36px;
            background: #1a73e8;
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
            font-family: 'Roboto', sans-serif;
            font-size: 12px;
            z-index: 1000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #34a853;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .button-group {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        .status-btn {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            gap: 4px;
            font-family: 'Roboto', sans-serif;
        }
        .status-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        .stop-btn {
            background: rgba(234, 67, 53, 0.9);
        }
        .stop-btn:hover {
            background: rgba(234, 67, 53, 1);
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
            margin-top: 36px;
            flex: 1;
        }
        @media (max-width: 768px) {
            .status-bar {
                height: 40px;
                font-size: 11px;
                padding: 0 8px;
            }
            .status-btn {
                padding: 4px 8px;
                font-size: 10px;
            }
            iframe {
                margin-top: 40px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status-bar">
            <div class="status-indicator">
                <div class="status-dot"></div>
                <span>MCP Shark Server Running</span>
            </div>
            <div class="button-group">
                <button class="status-btn" onclick="checkStatus()" title="Refresh Status">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                        <path d="M21 3v5h-5"></path>
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                        <path d="M3 21v-5h5"></path>
                    </svg>
                    Refresh
                </button>
                <button class="status-btn stop-btn" onclick="stopServer()" title="Stop MCP Shark Server">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                    </svg>
                    Stop Server
                </button>
            </div>
        </div>
        <iframe src="${MCP_SHARK_BASE_URL}" title="MCP Shark UI" allowfullscreen></iframe>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        
        function checkStatus() {
            vscode.postMessage({ command: 'checkStatus' });
        }
        
        function stopServer() {
            if (confirm('Are you sure you want to stop the MCP Shark server?')) {
                vscode.postMessage({ command: 'stopServer' });
            }
        }
        
        // Check status periodically
        setInterval(() => {
            vscode.postMessage({ command: 'checkStatus' });
        }, 10000); // Check every 10 seconds
        
        // Make iframe responsive on resize
        window.addEventListener('resize', () => {
            const iframe = document.querySelector('iframe');
            if (iframe) {
                iframe.style.width = '100%';
                iframe.style.height = '100%';
            }
        });
    </script>
</body>
</html>`;
}

module.exports = {
  getMcpSharkIframeHtml,
};


