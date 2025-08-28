# CLAUDE.md - CitrusVer Development Guide

## 🍋 Project Overview

**CitrusVer** is a standalone npm package that provides beautiful, interactive version bumping for Node.js projects. It combines smart git operations with an elegant CLI experience.

### Purpose
- Simplify version management for Node.js projects
- Provide interactive commit messages with version bumps
- Create a beautiful CLI experience with ASCII art and colors
- Work both as a global tool (`npx`) and local dependency

### Current Status
- Version: 1.0.0
- Ready for npm publishing
- Needs: GitHub repository creation and npm publication

## 🏗️ Architecture

### Technology Stack
- **Pure Node.js** - Zero external dependencies
- **Git Integration** - Uses child_process for git commands
- **NPM Integration** - Leverages npm version internally
- **CLI Graphics** - Custom ASCII art with ANSI color codes

### Project Structure
```
citrusver/
├── bin/                    # CLI executables
│   ├── citrusver.js       # Main entry point
│   ├── citrusver-patch.js # Direct patch command
│   ├── citrusver-minor.js # Direct minor command
│   └── citrusver-major.js # Direct major command
├── lib/                    # Core logic
│   ├── version-bump.js    # Main CitrusVer class
│   └── ascii-art.js       # Visual elements
├── templates/             # Commit message templates
│   └── conventional.json  # Conventional commit formats
├── examples/              # Usage examples
│   └── .citrusver.json   # Example configuration
├── package.json           # NPM package definition
├── README.md             # User documentation
├── CLAUDE.md            # This file
└── LICENSE              # MIT license
```

## 🚀 Publishing Instructions

### Prerequisites
1. **GitHub Account** - For repository hosting
2. **NPM Account** - For package publishing
3. **Git** - Version control
4. **Node.js** - Runtime environment

### Step 1: Create GitHub Repository
```bash
# Initialize git repository
cd citrusver
git init
git add .
git commit -m "Initial commit: CitrusVer interactive version bump utility"

# Create repository on GitHub (github.com/jakerains/citrusver)
# Then push:
git remote add origin https://github.com/jakerains/citrusver.git
git branch -M main
git push -u origin main
```

### Step 2: Prepare for NPM
```bash
# Login to npm
npm login

# Verify package name availability
npm view citrusver
# Should return "404 Not Found" if available
```

### Step 3: Publish to NPM
```bash
# First publication
npm publish

# Future updates (after making changes)
npm version patch  # or minor/major
npm publish
```

### Step 4: Test Installation
```bash
# Test global usage
npx citrusver --help

# Test local installation
npm install citrusver --save-dev
```

## 💻 Development

### Local Testing
```bash
# Make bin files executable
chmod +x bin/*.js

# Link package locally
npm link

# Test in another project
cd /path/to/test/project
npm link citrusver
citrusver patch
```

### Making Changes

#### Adding Features
1. Modify `lib/version-bump.js` for core logic
2. Update `lib/ascii-art.js` for visual changes
3. Test locally with `npm link`
4. Update version and publish

#### Updating Graphics
- ASCII art is in `lib/ascii-art.js`
- Uses ANSI escape codes for colors
- Test in multiple terminals for compatibility

#### Configuration Options
- Default config in `lib/version-bump.js` → `loadConfig()`
- User config loaded from `.citrusver.json`
- Template system in `templates/`

### Code Style
- Use 2-space indentation
- Async/await for asynchronous operations
- Clear error messages with emoji indicators
- Colorful but readable output

## 🔧 Implementation Details

### Core Class: CitrusVer

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

### Visual System

#### Color Codes
- Yellow (`\x1b[33m`) - Primary brand color (lemons!)
- Green (`\x1b[32m`) - Success states
- Cyan (`\x1b[36m`) - Information
- Gray (`\x1b[90m`) - Secondary text

#### ASCII Art
- Lemon graphic for help screen
- Box graphics for headers
- Success banner for completion

## 📋 User Workflows

### Basic Usage
```bash
npx citrusver patch
# Prompts for message
# Creates commit and tag
# Ready to push
```

### With Configuration
1. Create `.citrusver.json`
2. Set hooks, templates, auto-push
3. Run `citrusver minor`
4. Automated workflow executes

### CI/CD Integration
```json
{
  "preVersion": "npm test && npm run lint",
  "postVersion": "npm run build",
  "autoPush": true
}
```

## 🐛 Troubleshooting

### Common Issues

#### "Not a git repository"
- Ensure you're in a git-initialized directory
- Run `git init` if needed

#### "No package.json found"
- Must be run in Node.js project
- Check you're in project root

#### "Git working directory not clean"
- CitrusVer handles this by staging all changes
- If issues persist, check git status

#### Colors Not Showing
- Some terminals don't support ANSI codes
- Try different terminal emulator
- Colors are cosmetic, functionality remains

## 📈 Future Enhancements

### Potential Features
1. **Changelog Generation** - Auto-generate CHANGELOG.md
2. **Semantic Analysis** - Suggest version type based on commits
3. **Multiple Remotes** - Push to multiple git remotes
4. **Plugin System** - Extensible architecture
5. **Web UI** - Browser-based version management
6. **Dry Run Mode** - Preview changes without committing

### Performance Optimizations
- Cache configuration loading
- Parallel git operations where possible
- Lazy load ASCII art

## 🎯 Success Metrics

### Usage Goals
- 1000+ weekly downloads on npm
- 100+ GitHub stars
- Active in 50+ projects

### Quality Metrics
- Zero dependencies maintained
- <1s execution time
- Works on Node 14+

## 🤝 Maintenance

### Regular Tasks
- Update dependencies (none currently!)
- Test on new Node.js versions
- Respond to issues on GitHub
- Review and merge PRs

### Release Process
1. Make changes in feature branch
2. Test thoroughly with `npm link`
3. Update README if needed
4. Use CitrusVer itself to version!
5. Push to GitHub
6. Publish to npm

## 📝 Notes for Claude Agents

### Key Principles
1. **Beautiful UX** - This tool should delight users
2. **Zero Dependencies** - Keep it pure Node.js
3. **Smart Defaults** - Works great out of the box
4. **Configurable** - Power users can customize everything

### When Making Changes
- Test the visual output carefully
- Ensure backward compatibility
- Update documentation immediately
- Consider the user's workflow

### Testing Commands
```bash
# Test all version types
node bin/citrusver.js patch
node bin/citrusver.js minor
node bin/citrusver.js major

# Test help and version
node bin/citrusver.js --help
node bin/citrusver.js --version

# Test with config
echo '{"autoPush": true}' > .citrusver.json
node bin/citrusver.js patch
```

---

**CitrusVer** - Making version management beautiful, one lemon at a time! 🍋