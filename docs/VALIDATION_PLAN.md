# Extension Validation Plan

This document outlines the validation strategy to catch issues before rebuilding and installing the extension.

## Quick Start

Run validation before any build/install:
```bash
npm run validate
```

## Validation Checklist

### 1. Pre-Development Checks

Before starting development:
- [ ] Run `npm install` to ensure dependencies are installed
- [ ] Run `npm run validate` to check current state
- [ ] Review any warnings/errors

### 2. During Development

**Before making changes:**
- [ ] Understand what you're changing
- [ ] Check if similar patterns exist in codebase

**While coding:**
- [ ] Use VS Code's built-in syntax highlighting
- [ ] Watch for red squiggles (errors)
- [ ] Check for yellow squiggles (warnings)

**After making changes:**
- [ ] Run `npm run validate` immediately
- [ ] Fix any errors before continuing
- [ ] Review warnings (may indicate potential issues)

### 3. Pre-Build Validation

Before packaging/installing:
```bash
# Run full validation
npm run validate

# Check for common issues
node validate.js
```

### 4. Automated Validation

The `validate.js` script checks:

#### Package.json Validation
- ✅ Required fields present (name, version, publisher, etc.)
- ✅ Extension name format (no @ scoped names)
- ✅ Main file exists
- ✅ Icon file exists
- ✅ Commands are properly defined
- ✅ Views are properly defined
- ✅ Dependencies are accessible

#### Extension.js Validation
- ✅ File exists and is readable
- ✅ Required exports (activate, deactivate)
- ✅ No better-sqlite3 imports (should use sql.js)
- ✅ Template string functions are defined
- ✅ SQL.js API usage is correct
- ✅ Common syntax issues

#### File Structure
- ✅ Required files exist
- ✅ node_modules present (or warning)
- ✅ .vscodeignore exists (recommended)

## Common Issues and Fixes

### Issue: "formatBytes is not defined"
**Fix:** Add function definition before `getWebviewContent()`:
```javascript
function formatBytes(bytes) {
    // ... implementation
}
```

### Issue: "truncate is not defined"
**Fix:** Add function definition before `getWebviewContent()`:
```javascript
function truncate(str, maxLength) {
    // ... implementation
}
```

### Issue: "Module not found: better-sqlite3"
**Fix:** Ensure you're using `sql.js` instead:
```javascript
const initSqlJs = require('sql.js');
```

### Issue: "Database constructor error"
**Fix:** Use sql.js API:
```javascript
const SQL = await initSqlJs();
const db = new SQL.Database(buffer);
```

### Issue: "stmt.all() is not a function"
**Fix:** Use sql.js query pattern:
```javascript
stmt.bind({ $limit: limit });
const results = [];
while (stmt.step()) {
    results.push(stmt.getAsObject());
}
stmt.free();
```

## VS Code Integration

### Tasks
Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) and run:
- **"Tasks: Run Task"** → **"Validate Extension"**

### Watch Mode
The extension can be set to validate on file changes (configure in `.vscode/tasks.json`).

## Pre-Commit Hooks (Optional)

To automatically validate before commits, add to `package.json`:
```json
{
  "scripts": {
    "precommit": "npm run validate"
  }
}
```

Or use husky:
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run validate"
```

## Validation Workflow

```
┌─────────────────┐
│  Make Changes   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ npm run validate│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  ✅ Pass   ❌ Fail
    │         │
    │         └──► Fix Issues
    │                │
    │                └──► Re-validate
    │
    ▼
┌─────────────────┐
│  Ready to Test  │
└─────────────────┘
```

## Best Practices

1. **Validate Early, Validate Often**
   - Run validation after every significant change
   - Don't accumulate errors

2. **Fix Errors First**
   - Errors block functionality
   - Warnings are suggestions

3. **Review Warnings**
   - Some warnings indicate potential issues
   - Some are informational

4. **Keep Dependencies Updated**
   - Check for security vulnerabilities: `npm audit`
   - Update dependencies regularly

5. **Test After Validation**
   - Validation catches syntax/logic errors
   - Runtime testing catches behavior issues

## Troubleshooting

### Validation script fails to run
```bash
# Make sure it's executable
chmod +x validate.js

# Or run with node explicitly
node validate.js
```

### False positives
- Review the validation logic in `validate.js`
- Some checks are heuristics and may need adjustment

### Missing checks
- Add new validation rules to `validate.js`
- Follow the existing pattern

## Next Steps

After validation passes:
1. Test in Extension Development Host (F5)
2. Check console for runtime errors
3. Test all commands and features
4. Package extension: `vsce package`

