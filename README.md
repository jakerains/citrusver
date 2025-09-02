# 🍋 CitrusVer v2.0

> Next-generation version management for Node.js with beautiful CLI, comprehensive automation, and zero dependencies.

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
- 🎨 **Beautiful CLI** - Colorful ASCII art and clear visual feedback
- 💬 **Interactive Commits** - Enhanced commit interface with conventional commits support
- 🏷️ **Auto Git Tags** - Automatically creates version tags
- 📦 **Smart Staging** - Selective or automatic staging of changes
- ⚙️ **Configurable** - Extensive configuration via `.citrusver.json`
- 🪝 **Hooks System** - Pre/post version hooks and plugin support
- 🚀 **Zero Dependencies** - Pure Node.js, no bloat

### New in v2.0
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

## 🎊 What's New in v2.0

CitrusVer 2.0 is a **complete reimagining** of version management with 12 major enhancements:

- **🔍 Dry Run Mode** - Preview exactly what will happen before committing
- **📝 Automatic Changelogs** - Generate beautiful CHANGELOG.md from your commits
- **✅ Smart Confirmations** - Review all changes before applying them
- **📦 Monorepo Support** - Manage multiple packages effortlessly
- **🔄 Error Recovery** - Automatic rollback keeps your repo safe
- **🎯 Conventional Commits** - Full support with interactive type selection
- **🛡️ Branch Protection** - Prevent accidental releases from wrong branches
- **🔢 Flexible Versioning** - Date-based, prereleases, custom patterns
- **📊 NPM Integration** - Check existing versions, auto-publish
- **🎨 Enhanced UI** - Beautiful prompts for every interaction
- **🔌 Plugin System** - Extend with custom functionality
- **📋 Config Templates** - Get started instantly with presets

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

### 1. Initialize CitrusVer (optional)
```bash
# Interactive setup with templates
npx citrusver init

# Or use a specific template
npx citrusver init --template conventional
```

### 2. Bump Your Version
```bash
# Preview changes first (recommended)
npx citrusver patch --dry-run

# Apply the version bump
npx citrusver patch

# With changelog generation
npx citrusver minor --changelog

# Create a prerelease
npx citrusver prerelease --preid beta
```

### 3. Push and Publish
```bash
# If not using autoPush
git push origin main --tags

# If npm publishing is configured
npm publish
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

1. **Bumps version** in package.json
2. **Stages ALL changes** (including uncommitted work)
3. **Prompts for commit message** (optional)
4. **Creates commit** with message and version
5. **Creates git tag** (e.g., v1.0.1)
6. **Ready to push** with `git push origin main --tags`

### Interactive Commit Messages

When you run CitrusVer, it prompts for an optional commit message:

```
› Commit message for v1.0.1  (Enter to skip · Esc cancels): Fixed critical bug in auth system
```

Result: 
```
Fixed critical bug in auth system

v1.0.1
```

If you just press Enter, the commit message will be the version number only.

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

### Simple Version Bump
```bash
# Make your changes
# When ready to release:
citrusver patch
# Press Enter for default message
git push origin main --tags
```

### Feature Release with Message
```bash
# After developing feature
citrusver minor
# Type: "Add user authentication system"
git push origin main --tags
```

### CI/CD Integration
```json
{
  "preVersion": "npm test && npm run lint",
  "postVersion": "npm run build",
  "autoPush": true
}
```

### Conventional Commits
```json
{
  "commitTemplate": "chore(release): {{message}}\n\nv{{version}}"
}
```

## 🎨 Visual Experience

CitrusVer provides beautiful visual feedback with a clean, modern CLI:

```
╭──────────────────────────────────────────────╮
│  🍋 CitrusVer · MINOR RELEASE                │
├──────────────────────────────────────────────┤
│  Current   1.0.0                             │
│  Next      1.1.0                             │
│                                              │
│  Fresh-squeezed semver for your repo         │
╰──────────────────────────────────────────────╯

› Commit message for v1.1.0  (Enter to skip · Esc cancels)

🍋 Bumping minor version...
📦 Staging all changes...
💾 Creating version commit...
🏷️  Creating version tag...

✅ VERSION BUMPED!

New Version: v1.1.0
All changes have been committed
Git tag has been created

Next Step:
git push origin HEAD --tags

🍋 Fresh release squeezed! 🍋
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