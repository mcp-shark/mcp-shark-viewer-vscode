#!/usr/bin/env node
/**
 * Validation script for VS Code extension
 * Runs various checks before building/installing
 */

const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

const errors = [];
const warnings = [];

const logError = (message) => {
  errors.push(message);
  console.error(`❌ ERROR: ${message}`);
};

const logWarning = (message) => {
  warnings.push(message);
  console.warn(`⚠️  WARNING: ${message}`);
};

const logSuccess = (message) => {
  console.log(`✅ ${message}`);
};

const readJson = (jsonPath) => {
  try {
    return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  } catch (error) {
    logError(`Failed to parse ${path.basename(jsonPath)}: ${error.message}`);
    return null;
  }
};

const readText = (textPath) => {
  try {
    return fs.readFileSync(textPath, "utf8");
  } catch (error) {
    logError(`Failed to read ${path.basename(textPath)}: ${error.message}`);
    return null;
  }
};

const parseStringConstant = (content, name) => {
  const re = new RegExp(`const\\s+${name}\\s*=\\s*['"]([^'"]+)['"]`);
  const match = content.match(re);
  if (!match) {
    return null;
  }
  return match[1];
};

const parseCommandIdsMap = (content) => {
  const map = {};
  const blockMatch = content.match(/const\s+COMMAND_IDS\s*=\s*\{([\s\S]*?)\};/);
  if (!blockMatch) {
    return map;
  }

  const body = blockMatch[1];
  const re = /([A-Za-z0-9_]+)\s*:\s*['"]([^'"]+)['"]/g;

  const walk = () => {
    const match = re.exec(body);
    if (!match) {
      return;
    }
    map[match[1]] = match[2];
    walk();
  };

  walk();
  return map;
};

const extractRegisteredCommands = (content) => {
  const ids = new Set();
  const literals = /registerCommand\(\s*['"]([^'"]+)['"]/g;
  const fromConstants = /registerCommand\(\s*COMMAND_IDS\.([A-Za-z0-9_]+)/g;

  const commandIdsMap = parseCommandIdsMap(content);

  const walkLiterals = () => {
    const match = literals.exec(content);
    if (!match) {
      return;
    }
    ids.add(match[1]);
    walkLiterals();
  };

  const walkConstants = () => {
    const match = fromConstants.exec(content);
    if (!match) {
      return;
    }
    const key = match[1];
    const value = commandIdsMap[key];
    if (value) {
      ids.add(value);
    }
    walkConstants();
  };

  walkLiterals();
  walkConstants();
  return ids;
};

const extractCreatedTreeViews = (content) => {
  const ids = new Set();
  const literals = /createTreeView\(\s*['"]([^'"]+)['"]/g;
  const fromConstant = /createTreeView\(\s*VIEW_ID_TRAFFIC\b/g;

  const viewId = parseStringConstant(content, "VIEW_ID_TRAFFIC");

  const walkLiterals = () => {
    const match = literals.exec(content);
    if (!match) {
      return;
    }
    ids.add(match[1]);
    walkLiterals();
  };

  const hasConstantUsage = fromConstant.test(content);
  if (hasConstantUsage && viewId) {
    ids.add(viewId);
  }

  walkLiterals();
  return ids;
};

const listFilesRecursive = (dir) => {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFilesRecursive(full);
    }
    return [full];
  });
};

const getAllSourceText = () => {
  const mainPath = path.join(projectRoot, "extension.js");
  const srcDir = path.join(projectRoot, "src");

  const srcFiles = listFilesRecursive(srcDir).filter((p) => p.endsWith(".js"));
  const allFiles = [mainPath, ...srcFiles].filter((p) => fs.existsSync(p));
  const contents = allFiles.map((p) => readText(p)).filter((t) => Boolean(t));
  return contents.join("\n");
};

const validateFileStructure = () => {
  logSuccess("Validating file structure...");

  const requiredPaths = [
    "package.json",
    "extension.js",
    path.join("src", "extension", "index.js"),
  ];

  for (const p of requiredPaths) {
    const full = path.join(projectRoot, p);
    if (!fs.existsSync(full)) {
      logError(`Required file missing: ${p}`);
    }
  }

  return true;
};

const validatePackageJson = () => {
  logSuccess("Validating package.json...");
  const packagePath = path.join(projectRoot, "package.json");

  if (!fs.existsSync(packagePath)) {
    logError("package.json not found");
    return false;
  }

  const pkg = readJson(packagePath);
  if (!pkg) {
    return false;
  }

  const requiredFields = ["name", "version", "publisher", "displayName", "main", "engines"];
  for (const field of requiredFields) {
    if (!pkg[field]) {
      logError(`Missing required field: ${field}`);
    }
  }

  if (pkg.name?.includes("@")) {
    logError("Extension name cannot contain @ (use publisher field for namespace)");
  }

  if (pkg.main) {
    const mainPath = path.join(projectRoot, pkg.main);
    if (!fs.existsSync(mainPath)) {
      logError(`Main file not found: ${pkg.main}`);
    }
  }

  if (pkg.icon && !fs.existsSync(path.join(projectRoot, pkg.icon))) {
    logWarning(`Icon file not found: ${pkg.icon}`);
  }

  if (pkg.contributes && Array.isArray(pkg.contributes.commands)) {
    for (const cmd of pkg.contributes.commands) {
      if (!cmd.command || !cmd.title) {
        logError(`Invalid command definition: ${JSON.stringify(cmd)}`);
      }
    }
  } else {
    logWarning("No contributes.commands found in package.json");
  }

  if (pkg.contributes?.views) {
    for (const [containerId, views] of Object.entries(pkg.contributes.views)) {
      for (const view of views || []) {
        if (!view.id || !view.name) {
          logError(`Invalid view definition in ${containerId}: ${JSON.stringify(view)}`);
        }
      }
    }
  } else {
    logWarning("No contributes.views found in package.json");
  }

  if (!Array.isArray(pkg.activationEvents) || pkg.activationEvents.length === 0) {
    logWarning("No activationEvents configured; extension may not activate automatically");
  }

  if (pkg.dependencies) {
    for (const [dep, version] of Object.entries(pkg.dependencies)) {
      if (typeof version === "string" && (version.startsWith("file:") || version.startsWith("github:"))) {
        logWarning(`Using local/GitHub dependency: ${dep} - ensure it's accessible`);
      }
    }
  }

  return true;
};

const validateExtensionEntrypoint = () => {
  logSuccess("Validating extension entrypoint...");
  const extPath = path.join(projectRoot, "extension.js");
  const content = readText(extPath);
  if (!content) {
    return false;
  }

  if (!content.includes("module.exports")) {
    logError("extension.js must export activate and deactivate functions");
  }

  if (!content.includes("require(\"./src/extension\")") && !content.includes("require('./src/extension')")) {
    logWarning("extension.js should delegate to ./src/extension for implementation");
  }

  return true;
};

const validateContributionsMatchCode = () => {
  logSuccess("Validating contributes wiring...");

  const pkg = readJson(path.join(projectRoot, "package.json"));
  if (!pkg) {
    return false;
  }

  const code = getAllSourceText();
  const registered = extractRegisteredCommands(code);
  const createdTreeViews = extractCreatedTreeViews(code);

  const contributedCommands =
    pkg.contributes && Array.isArray(pkg.contributes.commands) ? pkg.contributes.commands : [];
  for (const cmd of contributedCommands) {
    if (cmd?.command && !registered.has(cmd.command)) {
      logError(`package.json contributes command not registered in code: ${cmd.command}`);
    }
  }

  const contributedViews = pkg.contributes?.views ? pkg.contributes.views : {};
  for (const [containerId, views] of Object.entries(contributedViews)) {
    for (const view of views || []) {
      if (view?.id && !createdTreeViews.has(view.id)) {
        logError(
          `package.json contributes view not created in code (container: ${containerId}): ${view.id}`
        );
      }
    }
  }

  return true;
};

const validateMcpSharkIntegration = () => {
  logSuccess("Validating MCP Shark integration assumptions...");
  const code = getAllSourceText();

  if (!code.includes("9853")) {
    logError("Expected MCP Shark server port 9853 not found in code");
  }

  const hasHttpBaseUrl =
    code.includes("http://localhost:9853") ||
    (code.includes("MCP_SHARK_BASE_URL") && code.includes("9853"));
  if (!hasHttpBaseUrl) {
    logWarning(
      "Expected base URL for MCP Shark (http://localhost:9853 or MCP_SHARK_BASE_URL) not found; ensure iframe/status checks point to MCP Shark"
    );
  }

  if (!code.includes("@mcp-shark/mcp-shark")) {
    logError("Expected '@mcp-shark/mcp-shark' to be referenced for server start");
  }

  const hasNpxSpawn = /spawn\(\s*['"]npx(?:\.cmd)?['"]/.test(code);
  if (!hasNpxSpawn) {
    logWarning("Expected server to start via spawn('npx', ...) (or npx.cmd); validate runtime behavior manually");
  }

  const hasAutoYes =
    code.includes("['-y'") ||
    code.includes('["-y"') ||
    code.includes('" -y"') ||
    code.includes("' -y'");
  if (!hasAutoYes) {
    logWarning("Expected npx auto-confirm flag '-y' when spawning MCP Shark server");
  }

  if (!code.includes("kill -TERM") && !code.includes("taskkill /PID")) {
    logWarning("Expected stop strategy to send SIGTERM (or taskkill on Windows); validate stopServer manually");
  }

  return true;
};

const checkCommonIssues = () => {
  logSuccess("Checking for common issues...");

  const nodeModulesPath = path.join(projectRoot, "node_modules");
  if (!fs.existsSync(nodeModulesPath)) {
    logWarning("node_modules not found - run npm install");
  }

  const vscodeignorePath = path.join(projectRoot, ".vscodeignore");
  if (!fs.existsSync(vscodeignorePath)) {
    logWarning(".vscodeignore not found - recommended for packaging");
  }

  const readmePath = path.join(projectRoot, "README.md");
  if (!fs.existsSync(readmePath)) {
    logWarning("README.md not found");
  }

  return true;
};

const runValidation = () => {
  console.log("\n🔍 Starting extension validation...\n");

  validateFileStructure();
  validatePackageJson();
  validateExtensionEntrypoint();
  validateContributionsMatchCode();
  validateMcpSharkIntegration();
  checkCommonIssues();

  console.log(`\n${"=".repeat(50)}`);
  console.log("📊 Validation Summary");
  console.log("=".repeat(50));

  if (errors.length > 0) {
    console.error(`\n❌ Found ${errors.length} error(s):`);
    errors.forEach((err, idx) => {
      console.error(`   ${idx + 1}. ${err}`);
    });
  }

  if (warnings.length > 0) {
    console.warn(`\n⚠️  Found ${warnings.length} warning(s):`);
    warnings.forEach((warn, idx) => {
      console.warn(`   ${idx + 1}. ${warn}`);
    });
  }

  if (errors.length === 0) {
    console.log("\n✅ All validations passed!");
    console.log("   Extension is ready for testing.\n");
    process.exit(0);
  }

  console.error("\n❌ Validation failed. Please fix the errors above.\n");
  process.exit(1);
};

runValidation();

