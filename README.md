# 🍋 CitrusVer v3.0

> Next-generation version management for Node.js with beautiful CLI, comprehensive automation, and zero dependencies.

## 🎉 What's New in v3.0

CitrusVer 3.0 introduces a **fundamental redesign** with a simpler, more predictable default behavior:

### Breaking Changes

**Default Behavior is Now Version-Only**
- Running `citrusver patch/minor/major` now **only updates package.json**
- No automatic git commits, tags, or prompts by default
- Git operations are now **opt-in via flags**

**Why This Change?**
- More predictable and aligned with user expectations
- Faster for simple version bumps
- Better composability with other tools
- Still maintains all the powerful features when you need them

### New Flag-Based System

Choose your workflow with intuitive flags:
- `citrusver patch` - Just bump the version (fast & simple)
- `citrusver patch --commit` - Bump + create commit
- `citrusver patch --tag` - Bump + commit + tag
- `citrusver patch --push` - Bump + commit + push
- `citrusver patch --full` - Complete workflow (v2 behavior)
- `citrusver patch --quiet` - Minimal output

<p align="center">
  <img src="https://img.shields.io/npm/v/citrusver?style=flat-square&color=yellow" alt="npm version">
  <img src="https://img.shields.io/npm/dm/citrusver?style=flat-square&color=green" alt="downloads">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="license">
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square" alt="zero dependencies">
</p>

<p align="center">
  <strong>🚀 12 Major New Features • 🎨 Beautiful CLI • ⚙️ Highly Configurable • 📦 Zero Dependencies</strong>
</p>

<p align="center">
  <em>Transform your release workflow with intelligent version management, automatic changelogs, branch protection, and more!</em>
</p>

## ✨ Features

### Core Features
- 🚀 **Simple by Default** - Just bump versions, nothing more (unless you want it)
- 🎨 **Beautiful CLI** - Colorful ASCII art and clear visual feedback
- 🎯 **Flag-Based Control** - Choose your workflow with intuitive flags
- 💬 **Optional Git Operations** - Commit, tag, and push when you need them
- 🔇 **Quiet Mode** - Minimal output for scripting and automation
- ⚙️ **Highly Configurable** - Extensive configuration via `.citrusver.json`
- 🚀 **Zero Dependencies** - Pure Node.js, no bloat

### Advanced Features (with --full flag)
- 🔍 **Dry Run Mode** - Preview changes without committing
- 📝 **Changelog Generation** - Automatic CHANGELOG.md updates
- ✅ **Confirmation Prompts** - Review changes before applying
- 📦 **Monorepo Support** - Handle workspaces and multiple packages
- 🔄 **Error Recovery** - Automatic rollback on failures
- 🎯 **Conventional Commits** - Full conventional commit workflow
- 🛡️ **Branch Protection** - Prevent accidental releases from wrong branches
- 🔢 **Version Strategies** - Semver, date-based, prereleases, custom patterns
- 📊 **NPM Registry Integration** - Check versions, auto-publish
- 🎨 **Interactive Mode** - Select commit types, scopes, breaking changes
- 🔌 **Plugin System** - Extend functionality with custom plugins
- 📋 **Config Templates** - Quick setup with predefined configurations
- 🪝 **Hooks System** - Pre/post version hooks (with git operation flags)

## 📦 Installation

### Quick Usage (no install needed)
```bash
npx citrusver patch
npx citrusver minor
npx citrusver major
```

### Install as Dev Dependency
```bash
npm install --save-dev citrusver
```

Then add to your `package.json` scripts:
```json
{
  "scripts": {
    "version:patch": "citrusver patch",
    "version:minor": "citrusver minor",
    "version:major": "citrusver major"
  }
}
```

### Install Globally
```bash
npm install -g citrusver
```

## 🚀 Quick Start

### Basic Usage (Version Only)
```bash
# Just bump the version - fast and simple!
npx citrusver patch    # 1.0.0 → 1.0.1
npx citrusver minor    # 1.0.0 → 1.1.0
npx citrusver major    # 1.0.0 → 2.0.0

# That's it! Only package.json is updated.
```

### With Git Operations
```bash
# Bump + create commit
npx citrusver patch --commit

# Bump + commit + tag
npx citrusver patch --tag

# Bump + commit + push to remote
npx citrusver patch --push

# Complete workflow (all features)
npx citrusver patch --full
```

### Preview Changes First
```bash
# See what will happen without making changes
npx citrusver patch --dry-run
npx citrusver minor --commit --dry-run
```

### Quiet Mode for Automation
```bash
# Minimal output - just the version number
npx citrusver patch --quiet
# Output: 1.0.1
```

## 📖 Usage Guide

### Basic Commands

```bash
# Bump patch version (1.0.0 → 1.0.1)
citrusver patch

# Bump minor version (1.0.0 → 1.1.0)
citrusver minor

# Bump major version (1.0.0 → 2.0.0)
citrusver major
```

### How It Works

**Default Behavior (No Flags):**
1. Updates `package.json` version
2. Updates `package-lock.json` version (if exists)
3. Shows success message
4. **That's it!** No git operations, no prompts

**With --commit Flag:**
1. Updates version files
2. Prompts for optional commit message
3. Stages package.json and package-lock.json
4. Creates git commit
5. Runs pre/post version hooks (if configured)

**With --tag Flag:**
1. All --commit operations
2. Creates annotated git tag (e.g., v1.0.1)

**With --push Flag:**
1. All --tag operations (if autoTag is true)
2. Pushes to remote with tags

**With --full Flag:**
1. All advanced features enabled
2. Branch protection checks
3. Changelog generation
4. Plugin hooks
5. NPM publishing (if configured)

### Flag Combinations

You can combine flags for custom workflows:
```bash
# Version only
citrusver patch

# Version + commit
citrusver patch --commit

# Version + commit + tag
citrusver patch --tag

# Version + commit + push (adds tag if autoTag is true)
citrusver patch --push

# Everything
citrusver patch --full

# Any combination with dry-run
citrusver patch --tag --dry-run

# Any combination in quiet mode
citrusver patch --commit --quiet
```

## ⚙️ Configuration

Create a `.citrusver.json` file in your project root:

```json
{
  "messageStyle": "interactive",
  "autoTag": true,
  "autoPush": false,
  "preVersion": "npm test",
  "postVersion": "npm run build",
  "commitTemplate": "Release: {{message}}\n\nVersion: {{version}}"
}
```

### Configuration Options

#### Basic Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `messageStyle` | string | `"interactive"` | How to handle commit messages |
| `autoTag` | boolean | `true` | Create git tags automatically |
| `autoPush` | boolean | `false` | Push to remote after versioning |
| `preVersion` | string | `null` | Command to run before version bump |
| `postVersion` | string | `null` | Command to run after version bump |
| `commitTemplate` | string | `null` | Custom commit message template |
| `confirmRelease` | boolean | `false` | Show confirmation before applying |
| `changelog` | boolean | `false` | Generate CHANGELOG.md automatically |

#### Advanced Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `conventionalCommits` | boolean | `false` | Enable conventional commit workflow |
| `versionStrategy` | string | `"semver"` | Version strategy: semver, date, custom |
| `plugins` | array | `[]` | List of plugins to load |
| `branch.protected` | array | `["main", "master"]` | Protected branch names |
| `branch.allowForce` | boolean | `false` | Allow force flag on protected branches |
| `monorepo.enabled` | boolean | `false` | Enable monorepo support |
| `monorepo.packages` | string | `"packages/*"` | Workspace packages pattern |
| `monorepo.independent` | boolean | `false` | Independent package versioning |
| `npm.publish` | boolean | `false` | Auto-publish to npm |
| `npm.access` | string | `"public"` | NPM package access level |
| `npm.checkRegistry` | boolean | `false` | Check if version exists on npm |

### Commit Templates

Use `{{message}}` and `{{version}}` placeholders:

```json
{
  "commitTemplate": "🚀 Release {{version}}: {{message}}"
}
```

## 🆕 New Features Usage

### Dry Run Mode
Preview what will happen without making changes:
```bash
citrusver patch --dry-run
```

### Changelog Generation
Automatically update CHANGELOG.md:
```bash
citrusver minor --changelog
```

### Conventional Commits
Use the enhanced interactive mode:
```json
{
  "conventionalCommits": true
}
```

### Prerelease Versions
Create alpha/beta releases:
```bash
citrusver prerelease --preid alpha
# 1.0.0 → 1.0.1-alpha.0
```

### Initialize Configuration
Quick setup with templates:
```bash
# Interactive setup
citrusver init

# Use a template
citrusver init --template conventional
citrusver init --template monorepo
```

### Monorepo Support
Configure for workspaces:
```json
{
  "monorepo": {
    "enabled": true,
    "packages": "packages/*",
    "independent": false
  }
}
```

### Branch Protection
Prevent releases from wrong branches:
```json
{
  "branch": {
    "protected": ["main", "master"],
    "releaseBranches": ["main", "release/*"]
  }
}
```

## 🎯 Common Workflows

### Quick Version Bump (v3.0 Default)
```bash
# Fast and simple - just bump the version
citrusver patch
# Done! Manual commit later if needed
```

### Traditional Release Workflow
```bash
# Bump version and create release commit
citrusver minor --tag
# Add custom message when prompted
git push origin main --tags
```

### Automated CI/CD Pipeline
```bash
# Quiet mode for scripts
VERSION=$(citrusver patch --quiet)
echo "Bumped to $VERSION"

# Or with full automation
citrusver patch --push
```

### Feature Release with Commit
```bash
# Develop your feature...
# When ready:
citrusver minor --commit
# Type: "Add user authentication system"
# Commit created automatically
git push
```

### Migration from v2.x to v3.0
```bash
# v2.x behavior (default created commit + tag)
# Now use --tag flag for same behavior:
citrusver patch --tag

# Or use --full for complete v2.x experience:
citrusver patch --full
```

### CI/CD Integration
```json
{
  "preVersion": "npm test && npm run lint",
  "postVersion": "npm run build",
  "autoPush": true
}
```

Then use:
```bash
citrusver patch --commit  # Hooks run with git operation flags
```

## 🎨 Visual Experience

CitrusVer provides beautiful visual feedback with a clean, modern CLI:

### Default Behavior (Version Only)
```
╭──────────────────────────────────────────────╮
│  🍋 CitrusVer · PATCH RELEASE                │
├──────────────────────────────────────────────┤
│  Current   1.0.0                             │
│  Next      1.0.1                             │
│                                              │
│  Fresh-squeezed semver for your repo         │
╰──────────────────────────────────────────────╯

🍋 Bumping patch version...

========================================
      ✅ VERSION BUMPED! ✅
========================================

     New Version: v1.0.1

     package.json has been updated

----------------------------------------

     🍋 Fresh release squeezed! 🍋
```

### With --tag Flag (Commit + Tag)
```
╭──────────────────────────────────────────────╮
│  🍋 CitrusVer · MINOR RELEASE                │
├──────────────────────────────────────────────┤
│  Current   1.0.0                             │
│  Next      1.1.0                             │
│                                              │
│  Fresh-squeezed semver for your repo         │
╰──────────────────────────────────────────────╯

› Commit message for v1.1.0  (Enter to skip · Esc cancels): Add user authentication

🍋 Bumping minor version...
📦 Staging changes...
💾 Creating version commit...
🏷️  Creating version tag...

========================================
      ✅ VERSION BUMPED! ✅
========================================

     New Version: v1.1.0

     Changes have been committed
     Git tag has been created

----------------------------------------

Next Step:
git push origin HEAD --tags

🍋 Fresh release squeezed! 🍋
```

### Quiet Mode (--quiet)
```
$ citrusver patch --quiet
1.0.1
```

## 🔧 Advanced Features

### Pre/Post Hooks

Run commands before and after versioning:

```json
{
  "preVersion": "npm test",
  "postVersion": "npm run build && npm run docs"
}
```

### Auto Push

Automatically push to remote after versioning:

```json
{
  "autoPush": true
}
```

### Custom Templates

Create project-specific commit formats:

```json
{
  "commitTemplate": "[{{version}}] {{message}}"
}
```

## 🔌 Plugin System

CitrusVer supports custom plugins to extend functionality:

### Creating a Plugin
```javascript
// .citrusver/plugins/my-plugin.js
class MyPlugin {
  constructor() {
    this.name = 'my-plugin';
    this.version = '1.0.0';
    this.hooks = {
      'pre-version': this.preVersion.bind(this),
      'post-version': this.postVersion.bind(this)
    };
  }

  async preVersion(context) {
    console.log('Running pre-version hook');
    // Your logic here
  }

  async postVersion(context) {
    console.log('Version bumped to:', context.version);
    // Your logic here
  }
}

module.exports = MyPlugin;
```

### Using Plugins
```json
{
  "plugins": ["./citrusver/plugins/my-plugin"]
}
```

### Available Hooks
- `pre-version` - Before version bump
- `post-version` - After version bump
- `pre-commit` - Before creating commit
- `post-commit` - After creating commit
- `pre-tag` - Before creating tag
- `post-tag` - After creating tag
- `changelog-generate` - During changelog generation
- `version-calculate` - Custom version calculation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT © Jake Rains

## 🙏 Acknowledgments

- Inspired by `npm version` but with better UX
- ASCII art created with love and lemons 🍋
- Built for developers who appreciate beautiful CLIs

---

<p align="center">Made with 🍋 by <a href="https://github.com/jakerains">Jake Rains</a></p>