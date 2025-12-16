function getStartServerHtml({ message = null, imageUri = null } = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Shark - Start Server</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
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
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            text-align: center;
            max-width: 500px;
            width: 100%;
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
</body>
</html>`;
}

module.exports = {
  getStartServerHtml,
};


