# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🍋 Project Overview

**CitrusVer v3.0** is a standalone npm package that provides beautiful, interactive version bumping for Node.js projects. It features a simple default behavior with optional git operations via flags.

### Purpose
- Simplify version management for Node.js projects (version-only by default)
- Optional git operations via intuitive flags (--commit, --tag, --push, --full)
- Provide interactive commit messages when using git operations
- Create a beautiful CLI experience with ASCII art and colors
- Work both as a global tool (`npx`) and local dependency

### v3.0 Breaking Change
- **Default behavior now only updates package.json** (no git operations)
- Git operations (commit, tag, push) are opt-in via flags
- Hooks only run when using git operation flags


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

# Test all version types locally (v3.0 default - version only)
node bin/citrusver.js patch
node bin/citrusver.js minor
node bin/citrusver.js major

# Test with flags
node bin/citrusver.js patch --commit      # Version + commit
node bin/citrusver.js patch --tag         # Version + commit + tag
node bin/citrusver.js patch --push        # Version + commit + push
node bin/citrusver.js patch --full        # Complete workflow
node bin/citrusver.js patch --quiet       # Minimal output
node bin/citrusver.js patch --dry-run     # Preview changes

# Test help and version flags
node bin/citrusver.js --help
node bin/citrusver.js --version

# Test with custom config
echo '{"autoPush": true}' > .citrusver.json
node bin/citrusver.js patch --commit
```

### Publishing to NPM
```bash
# Use CitrusVer itself to bump version
./bin/citrusver.js patch --tag  # Bumps to next version + creates tag

# Publish to npm
npm publish
```


## 🎯 Architecture & Core Components

### Core Class: CitrusVer (`lib/version-bump.js`)

#### Methods (v3.0)
- `loadConfig()` - Loads user configuration
- `promptForMessage()` - Interactive commit message prompt (only with git flags)
- `formatCommitMessage()` - Applies templates to messages
- `checkGitRepo()` - Validates git repository (only with git flags)
- `checkPackageJson()` - Validates Node.js project
- `runPreVersionHook()` - Executes pre-version command (only with git flags)
- `runPostVersionHook()` - Executes post-version command (only with git flags)
- **`bump(versionType, options)`** - Router method that dispatches to appropriate bump method based on flags
- **`bumpVersionOnly(versionType, options)`** - Core version bumping (no git operations)
- **`bumpWithCommit(versionType, options)`** - Version bump + git commit
- **`bumpWithTag(versionType, options)`** - Version bump + commit + tag
- **`bumpWithPush(versionType, options)`** - Version bump + commit + push (tags if autoTag is true)
- **`bumpFull(versionType, options)`** - Complete workflow with all features

#### Configuration Schema
```json
{
  "messageStyle": "interactive|conventional|simple",
  "autoTag": boolean,                    // Only applies with --commit, --push, or --full
  "autoPush": boolean,                   // Only applies with --commit or --full
  "preVersion": "command string",        // Only runs with git operation flags
  "postVersion": "command string",       // Only runs with git operation flags
  "commitTemplate": "template with {{placeholders}}"  // Only used with git operation flags
}
```

#### CLI Flags (v3.0)
- **No flags** - Version bump only (package.json + package-lock.json)
- **`--commit`** - Version bump + git commit (prompts for message)
- **`--tag`** - Version bump + commit + annotated tag (implies --commit)
- **`--push`** - Version bump + commit + push to remote (implies --commit)
- **`--full`** - Complete workflow with all advanced features
- **`--quiet`** - Minimal output (just version number)
- **`--dry-run`** - Preview changes without executing

### Visual System (`lib/ascii-art.js`)
- ASCII art components: lemon graphic, box graphics, success banner
- ANSI color codes: Yellow (\x1b[33m), Green (\x1b[32m), Cyan (\x1b[36m), Gray (\x1b[90m)


## 🔎 Key Implementation Notes

### v3.0 Default Behavior
- **No git operations by default** - Only updates package.json and package-lock.json
- Git repository is NOT required for default behavior
- Fast and predictable version bumping
- No prompts, no commits, no tags unless flags are used

### Git Integration (with flags)
- Uses `child_process.exec` for all git commands
- **Only stages package.json and package-lock.json** (not all uncommitted changes)
- Git operations are opt-in via flags: --commit, --tag, --push, --full
- Creates annotated tags (e.g., v1.0.1) when using --tag or --push
- Git validation only runs when using git operation flags

### Flag Behavior
- **Default** (no flags): `bumpVersionOnly()` - Updates version files only
- **`--commit`**: `bumpWithCommit()` - Updates files + creates commit
- **`--tag`**: `bumpWithTag()` - Updates files + commit + tag
- **`--push`**: `bumpWithPush()` - Updates files + commit + push (tags if autoTag)
- **`--full`**: `bumpFull()` - Complete workflow with all advanced features

### Error Handling
- All async operations wrapped in try-catch
- Clear error messages with context
- Non-zero exit codes for CI/CD integration




## 🔑 Key Principles When Making Changes

1. **Simple by Default** (v3.0) - Default behavior should only update version files, no git operations
2. **Zero Dependencies** - Never add external dependencies. Pure Node.js only.
3. **Beautiful CLI** - Maintain colorful ASCII art and clear visual feedback
4. **Flag-Based Control** - All git operations must be opt-in via flags
5. **Backward Compatibility** - Don't break existing `.citrusver.json` configs
6. **Git Safety** - Always validate git state before git operations (when using flags)
7. **Test Visual Output** - Check ASCII art renders correctly in different terminals
8. **Quiet Mode** - Ensure --quiet flag only outputs the version number

## 📋 v3.0 Migration Guide

For users upgrading from v2.x:
- **v2.x default** (auto commit + tag) → Use `citrusver patch --tag` in v3.0
- **v2.x with autoPush** → Use `citrusver patch --push` in v3.0
- **v2.x full workflow** → Use `citrusver patch --full` in v3.0
- **Simple version bump** → Use `citrusver patch` (new default in v3.0)