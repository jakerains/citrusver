# 🍋 CitrusVer

> Beautiful, interactive version bumping for Node.js projects with git tagging and custom commit messages.

<p align="center">
  <img src="https://img.shields.io/npm/v/citrusver?style=flat-square&color=yellow" alt="npm version">
  <img src="https://img.shields.io/npm/dm/citrusver?style=flat-square&color=green" alt="downloads">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="license">
</p>

<p align="center">
  <strong>Interactive • Beautiful • Configurable • Zero Dependencies</strong>
</p>

## ✨ Features

- 🎨 **Beautiful CLI** - Colorful ASCII art and clear visual feedback
- 💬 **Interactive Commits** - Optional custom commit messages with every version bump
- 🏷️ **Auto Git Tags** - Automatically creates version tags
- 📦 **Smart Staging** - Includes all uncommitted changes in version commit
- ⚙️ **Configurable** - Project-specific settings via `.citrusver.json`
- 🪝 **Pre/Post Hooks** - Run tests before versioning, build after
- 🚀 **Zero Dependencies** - Pure Node.js, no bloat

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

## 🚀 Usage

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
💬 Enter a commit message for v1.0.1
   (or press Enter to use version only): Fixed critical bug in auth system
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

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `messageStyle` | string | `"interactive"` | How to handle commit messages |
| `autoTag` | boolean | `true` | Create git tags automatically |
| `autoPush` | boolean | `false` | Push to remote after versioning |
| `preVersion` | string | `null` | Command to run before version bump |
| `postVersion` | string | `null` | Command to run after version bump |
| `commitTemplate` | string | `null` | Custom commit message template |

### Commit Templates

Use `{{message}}` and `{{version}}` placeholders:

```json
{
  "commitTemplate": "🚀 Release {{version}}: {{message}}"
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

CitrusVer provides beautiful visual feedback:

```
╔═══════════════════════════════════════╗
║  CitrusVer ━ Interactive Versioning   ║
╚═══════════════════════════════════════╝

╭─────────────────────────╮
│  MINOR (Feature)        │
│  1.0.0 → 1.1.0         │
╰─────────────────────────╯

🍋 Bumping minor version...
📦 Staging all changes...
💬 Enter a commit message for v1.1.0
💾 Creating version commit...
🏷️  Creating version tag...

╔═══════════════════════════════════════╗
║         ✨ SUCCESS! ✨                 ║
║                                        ║
║   Version bumped to v1.1.0            ║
╚═══════════════════════════════════════╝
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