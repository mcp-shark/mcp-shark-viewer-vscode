const http = require("node:http");

const httpGetStatusCode = (url, { timeoutMs = 1000 } = {}) => {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      res.resume();
      resolve(res.statusCode || 0);
    });

    req.on("error", () => {
      resolve(0);
    });

    req.on("timeout", () => {
      req.destroy();
      resolve(0);
    });
  });
};

const httpGetJson = (url, { timeoutMs = 2000 } = {}) => {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      const statusCode = res.statusCode || 0;
      res.setEncoding("utf8");

      const chunks = [];
      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        const raw = chunks.join("");

        if (statusCode < 200 || statusCode >= 300) {
          reject(
            new Error(
              `GET ${url} failed: HTTP ${statusCode}${raw ? ` - ${raw.slice(0, 200)}` : ""}`
            )
          );
          return;
        }

        try {
          resolve(JSON.parse(raw || "{}"));
        } catch (error) {
          reject(new Error(`GET ${url} returned invalid JSON: ${error.message}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`GET ${url} timed out after ${timeoutMs}ms`));
    });
  });
};

module.exports = {
  httpGetJson,
  httpGetStatusCode,
};


