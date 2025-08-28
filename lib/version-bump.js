#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const { 
  colors, 
  citrusHeader, 
  versionTypeGraphics, 
  showSuccess,
  colorize 
} = require('./ascii-art');

class CitrusVer {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    const configPath = path.join(process.cwd(), '.citrusver.json');
    const defaultConfig = {
      messageStyle: 'interactive',
      autoTag: true,
      autoPush: false,
      preVersion: null,
      postVersion: null,
      commitTemplate: null
    };

    if (fs.existsSync(configPath)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return { ...defaultConfig, ...userConfig };
      } catch (error) {
        console.warn('⚠️  Invalid .citrusver.json config, using defaults');
        return defaultConfig;
      }
    }

    return defaultConfig;
  }

  async promptForMessage(version, versionType) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      console.log('');
      const prompt = `${colors.brightCyan}💬 Enter a commit message for ${colors.brightYellow}v${version}${colors.reset}\n${colors.gray}   (or press Enter to use version only)${colors.reset}: `;
      rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  formatCommitMessage(customMessage, version) {
    if (!customMessage) {
      return version;
    }

    if (this.config.commitTemplate) {
      return this.config.commitTemplate
        .replace('{{message}}', customMessage)
        .replace('{{version}}', version);
    }

    // Default format: custom message with version appended
    return `${customMessage}\n\nv${version}`;
  }

  checkGitRepo() {
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
      return true;
    } catch {
      console.error('❌ Not a git repository. CitrusVer requires git.');
      process.exit(1);
    }
  }

  checkPackageJson() {
    const packagePath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packagePath)) {
      console.error('❌ No package.json found. CitrusVer requires a Node.js project.');
      process.exit(1);
    }
    return packagePath;
  }

  runPreVersionHook() {
    if (this.config.preVersion) {
      console.log('🔄 Running pre-version hook...');
      try {
        execSync(this.config.preVersion, { stdio: 'inherit' });
        console.log('✅ Pre-version hook completed');
      } catch (error) {
        console.error('❌ Pre-version hook failed');
        process.exit(1);
      }
    }
  }

  runPostVersionHook() {
    if (this.config.postVersion) {
      console.log('🔄 Running post-version hook...');
      try {
        execSync(this.config.postVersion, { stdio: 'inherit' });
        console.log('✅ Post-version hook completed');
      } catch (error) {
        console.warn('⚠️  Post-version hook failed, but version was still bumped');
      }
    }
  }

  async bump(versionType) {
    // Show beautiful header
    console.log(citrusHeader);
    console.log(versionTypeGraphics[versionType]);

    this.checkGitRepo();
    const packagePath = this.checkPackageJson();

    // Run pre-version hook
    this.runPreVersionHook();

    console.log(`${colors.brightYellow}🍋 Bumping ${versionType} version...${colors.reset}`);
    
    // Bump version in package.json without creating git commit
    try {
      execSync(`npm version ${versionType} --no-git-tag-version`, { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Failed to bump version in package.json');
      process.exit(1);
    }

    // Get the new version
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const newVersion = packageJson.version;

    // Stage all changes
    console.log(`${colors.cyan}📦 Staging all changes...${colors.reset}`);
    execSync('git add -A');

    // Get custom commit message
    const customMessage = await this.promptForMessage(newVersion, versionType);
    const commitMessage = this.formatCommitMessage(customMessage, newVersion);

    // Create commit
    console.log(`${colors.cyan}💾 Creating version commit...${colors.reset}`);
    execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);

    // Create tag if enabled
    if (this.config.autoTag) {
      console.log(`${colors.cyan}🏷️  Creating version tag...${colors.reset}`);
      execSync(`git tag -a "v${newVersion}" -m "Version ${newVersion}"`);
    }

    // Auto-push if enabled
    if (this.config.autoPush) {
      console.log(`${colors.cyan}📤 Pushing to remote...${colors.reset}`);
      const pushCmd = this.config.autoTag ? 'git push origin HEAD --tags' : 'git push origin HEAD';
      execSync(pushCmd);
    }

    // Run post-version hook
    this.runPostVersionHook();

    // Show success message with beautiful graphics
    showSuccess(newVersion);
    
    if (!this.config.autoPush) {
      console.log(`${colors.gray}📤 To publish these changes, run:${colors.reset}`);
      console.log(`   ${colors.brightCyan}git push origin HEAD${this.config.autoTag ? ' --tags' : ''}${colors.reset}`);
    }

    return newVersion;
  }
}

module.exports = CitrusVer;