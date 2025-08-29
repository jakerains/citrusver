# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🍋 Project Overview

**CitrusVer** is a standalone npm package that provides beautiful, interactive version bumping for Node.js projects. It combines smart git operations with an elegant CLI experience.

### Purpose
- Simplify version management for Node.js projects
- Provide interactive commit messages with version bumps
- Create a beautiful CLI experience with ASCII art and colors
- Work both as a global tool (`npx`) and local dependency


## 🏗️ Architecture

### Technology Stack
- **Pure Node.js** - Zero external dependencies
- **Git Integration** - Uses child_process for git commands
- **NPM Integration** - Leverages npm version internally
- **CLI Graphics** - Custom ASCII art with ANSI color codes


## 🚀 Common Commands

### Testing & Development
```bash
# Link package locally for development
npm link

# Test in another project
cd /path/to/test/project
npm link citrusver
citrusver patch

# Test all version types locally
node bin/citrusver.js patch
node bin/citrusver.js minor
node bin/citrusver.js major

# Test help and version flags
node bin/citrusver.js --help
node bin/citrusver.js --version

# Test with custom config
echo '{"autoPush": true}' > .citrusver.json
node bin/citrusver.js patch
```

### Publishing to NPM
```bash
# Use CitrusVer itself to bump version
./bin/citrusver.js patch  # or minor/major

# Publish to npm
npm publish
```


## 🎯 Architecture & Core Components

### Core Class: CitrusVer (`lib/version-bump.js`)

#### Methods
- `loadConfig()` - Loads user configuration
- `promptForMessage()` - Interactive commit message prompt
- `formatCommitMessage()` - Applies templates to messages
- `checkGitRepo()` - Validates git repository
- `checkPackageJson()` - Validates Node.js project
- `runPreVersionHook()` - Executes pre-version command
- `runPostVersionHook()` - Executes post-version command
- `bump()` - Main versioning logic

#### Configuration Schema
```json
{
  "messageStyle": "interactive|conventional|simple",
  "autoTag": boolean,
  "autoPush": boolean,
  "preVersion": "command string",
  "postVersion": "command string",
  "commitTemplate": "template with {{placeholders}}"
}
```

### Visual System (`lib/ascii-art.js`)
- ASCII art components: lemon graphic, box graphics, success banner
- ANSI color codes: Yellow (\x1b[33m), Green (\x1b[32m), Cyan (\x1b[36m), Gray (\x1b[90m)


## 🔎 Key Implementation Notes

### Git Integration
- Uses `child_process.exec` for all git commands
- Automatically stages ALL uncommitted changes before version bump
- Creates annotated tags (e.g., v1.0.1)
- Handles dirty working directories gracefully

### Error Handling
- All async operations wrapped in try-catch
- Clear error messages with context
- Non-zero exit codes for CI/CD integration




## 🔑 Key Principles When Making Changes

1. **Zero Dependencies** - Never add external dependencies. Pure Node.js only.
2. **Beautiful CLI** - Maintain colorful ASCII art and clear visual feedback
3. **Backward Compatibility** - Don't break existing `.citrusver.json` configs
4. **Git Safety** - Always validate git state before operations
5. **Test Visual Output** - Check ASCII art renders correctly in different terminals