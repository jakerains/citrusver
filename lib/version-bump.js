#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const { 
  colors, 
  citrusHeader, 
  versionTypeGraphics,
  createReleaseBox,
  detailedLemon, 
  showSuccess,
  colorize 
} = require('./ascii-art');
const ChangelogGenerator = require('./utils/changelog');
const VersionStrategies = require('./utils/version-strategies');
const NPMRegistry = require('./utils/npm-registry');
const MonorepoManager = require('./utils/monorepo');
const RollbackManager = require('./utils/rollback');
const BranchProtection = require('./utils/branch-protection');
const InteractiveMode = require('./utils/interactive');
const { PluginManager } = require('./plugins/plugin-manager');

class CitrusVer {
  constructor() {
    this.config = this.loadConfig();
    this.changelog = new ChangelogGenerator();
    this.versionStrategies = new VersionStrategies();
    this.npmRegistry = new NPMRegistry();
    this.rollback = new RollbackManager();
    this.interactive = new InteractiveMode();
    this.pluginManager = new PluginManager();
    this.initializeModules();
  }

  async initializeModules() {
    // Initialize branch protection
    this.branchProtection = new BranchProtection(this.config.branch || {});
    
    // Initialize monorepo if configured
    if (this.config.monorepo?.enabled) {
      this.monorepo = new MonorepoManager(this.config.monorepo);
    }
    
    // Load plugins
    if (this.config.plugins) {
      await this.pluginManager.loadPlugins(this.config);
    }
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

    // Enable raw mode to detect escape key
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    return new Promise((resolve, reject) => {
      const prompt = `\n› Commit message for ${colors.green}v${version}${colors.reset}  ${colors.gray}(Enter to skip · Esc cancels)${colors.reset}: `;
      
      // Listen for escape key
      const onKeypress = (chunk) => {
        // ESC key
        if (chunk && chunk.toString() === '\u001b') {
          if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
          }
          rl.close();
          console.log(`\n${colors.gray}Release cancelled.${colors.reset}`);
          process.exit(0);
        }
      };

      process.stdin.on('data', onKeypress);

      rl.question(prompt, (answer) => {
        process.stdin.removeListener('data', onKeypress);
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
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

  async bump(versionType, options = {}) {
    // Route to appropriate bump method based on flags

    // --full flag: Complete workflow with all features
    if (options.full) {
      return this.bumpFull(versionType, options);
    }

    // --push flag: Version bump + commit + push (with tag if autoTag is true)
    if (options.push) {
      return this.bumpWithPush(versionType, options);
    }

    // --tag flag: Version bump + commit + tag
    if (options.tag) {
      return this.bumpWithTag(versionType, options);
    }

    // --commit flag: Version bump + git commit
    if (options.commit) {
      return this.bumpWithCommit(versionType, options);
    }

    // Default: Version bump only (no git operations)
    return this.bumpVersionOnly(versionType, options);
  }

  async bumpFull(versionType, options = {}) {
    // Initialize modules if not already done
    await this.initializeModules();
    
    this.checkGitRepo();
    const packagePath = this.checkPackageJson();

    // Save state for potential rollback
    if (!options.dryRun) {
      await this.rollback.saveState({
        operation: 'version-bump',
        versionType,
        options
      });
    }

    try {
      // Check branch protection
      if (!options.skipBranchCheck) {
        const branchStatus = await this.branchProtection.checkBranchStatus(options);
        if (!branchStatus.valid && !options.force) {
          const action = await this.branchProtection.promptForBranchAction(branchStatus);
          if (action.action === 'abort') {
            console.log(`${colors.gray}Version bump cancelled${colors.reset}`);
            process.exit(0);
          } else if (action.action === 'create-branch') {
            const currentVersion = this.getCurrentVersion(packagePath);
            await this.branchProtection.createReleaseBranch(currentVersion);
          }
        }
      }

      // Handle uncommitted changes
      await this.handleUncommittedChanges(options);

      // Execute pre-version plugin hooks
      await this.pluginManager.executeHook('pre-version', {
        versionType,
        options,
        config: this.config
      });

      // Run pre-version hook
      if (!options.dryRun) {
        this.runPreVersionHook();
      }

      // Calculate what the new version will be
      const currentPackageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const currentVersion = currentPackageJson.version;
      
      // Use version strategy
      let newVersion;
      if (versionType === 'prerelease') {
        newVersion = this.versionStrategies.prereleaseStrategy(
          currentVersion, 
          'patch', 
          options.preid || 'alpha'
        );
      } else if (this.config.versionStrategy) {
        const strategy = this.versionStrategies.getStrategy(this.config.versionStrategy);
        newVersion = strategy(currentVersion, versionType);
      } else {
        newVersion = this.versionStrategies.semverStrategy(currentVersion, versionType);
      }

      // Check if version exists on npm
      if (this.config.npm?.checkRegistry && !options.dryRun) {
        const registryInfo = await this.npmRegistry.checkVersion(
          currentPackageJson.name, 
          newVersion
        );
        if (registryInfo.exists) {
          console.log(`${colors.yellow}⚠️  Version ${newVersion} already exists on npm${colors.reset}`);
          if (!options.force) {
            console.log('Use --force to override or choose a different version');
            process.exit(1);
          }
        }
      }

      // Show the beautiful release box
      console.log(createReleaseBox(versionType, currentVersion, newVersion));

      // Get commit details with enhanced interactive mode
      let commitDetails;
      let commitMessage;
      
      if (this.config.conventionalCommits || options.interactive) {
        commitDetails = await this.interactive.getCommitDetails(newVersion, {
          conventionalCommits: this.config.conventionalCommits,
          detailedDescription: this.config.detailedCommits
        });
        commitMessage = this.interactive.formatCommitMessage(
          commitDetails, 
          newVersion, 
          this.config.commitTemplate
        );
      } else {
        const customMessage = await this.promptForMessage(newVersion, versionType);
        commitMessage = this.formatCommitMessage(customMessage, newVersion);
      }

      // Show confirmation if enabled
      if (this.config.confirmRelease && !options.noConfirm && !options.dryRun) {
        const files = this.getUncommittedFiles();
        const confirmed = await this.interactive.confirmRelease({
          currentVersion,
          newVersion,
          versionType,
          commitType: commitDetails?.type,
          breaking: commitDetails?.breaking,
          files,
          message: commitMessage
        });
        
        if (!confirmed) {
          console.log(`${colors.gray}Version bump cancelled${colors.reset}`);
          await this.rollback.rollback();
          process.exit(0);
        }
      }

      // Dry run mode - show what would happen
      if (options.dryRun) {
        await this.showDryRun({
          currentVersion,
          newVersion,
          versionType,
          commitMessage,
          files: this.getUncommittedFiles(),
          wouldTag: this.config.autoTag,
          wouldPush: this.config.autoPush,
          changelog: options.changelog
        });
        return newVersion;
      }

      // Now actually bump the version
      console.log(`${colors.brightYellow}🍋 Bumping ${versionType} version...${colors.reset}`);
      
      // Handle monorepo
      if (this.monorepo) {
        const packages = await this.monorepo.bumpPackageVersions(versionType, options);
        console.log(`${colors.green}✓ Updated ${packages.length} packages${colors.reset}`);
      } else {
        // Regular single package bump
        currentPackageJson.version = newVersion;
        fs.writeFileSync(packagePath, JSON.stringify(currentPackageJson, null, 2) + '\n');
        if (!options.quiet) {
          console.log(`${colors.green}✓ Updated package.json${colors.reset}`);
        }
      }

      // Generate changelog if enabled
      if (options.changelog || this.config.changelog) {
        console.log(`${colors.cyan}📝 Generating changelog...${colors.reset}`);
        await this.changelog.generate(currentVersion, newVersion, {
          conventionalOnly: this.config.conventionalCommits
        });
      }

      // Stage changes (with selective staging if enabled)
      if (options.selective) {
        const files = this.getUncommittedFiles();
        const selectedFiles = await this.interactive.selectFiles(files);
        selectedFiles.forEach(file => {
          execSync(`git add "${file}"`);
        });
        console.log(`${colors.cyan}📦 Staged ${selectedFiles.length} files${colors.reset}`);
      } else {
        console.log(`${colors.cyan}📦 Staging all changes (git add -A)...${colors.reset}`);
        execSync('git add -A');
      }

      // Execute pre-commit plugin hooks
      await this.pluginManager.executeHook('pre-commit', {
        version: newVersion,
        message: commitMessage,
        config: this.config
      });

      // Create commit
      console.log(`${colors.cyan}💾 Creating version commit...${colors.reset}`);
      execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);

      // Create tag if enabled
      if (this.config.autoTag) {
        console.log(`${colors.cyan}🏷️  Creating version tag...${colors.reset}`);
        execSync(`git tag -a "v${newVersion}" -m "Version ${newVersion}"`);
        await this.rollback.saveState({ createdTag: `v${newVersion}` });
      }

      // Auto-push if enabled
      if (this.config.autoPush) {
        console.log(`${colors.cyan}📤 Pushing to remote...${colors.reset}`);
        const pushCmd = this.config.autoTag ? 'git push origin HEAD --tags' : 'git push origin HEAD';
        execSync(pushCmd);
      }

      // NPM publish if configured
      if (this.config.npm?.publish && !options.skipPublish) {
        console.log(`${colors.cyan}📦 Publishing to npm...${colors.reset}`);
        const publishResult = await this.npmRegistry.publish({
          tag: this.config.npm.tag || 'latest',
          access: this.config.npm.access || 'public'
        });
        if (publishResult.success) {
          console.log(`${colors.green}✓ Published to npm${colors.reset}`);
        } else {
          console.warn(`${colors.yellow}⚠️  NPM publish failed: ${publishResult.error}${colors.reset}`);
        }
      }

      // Execute post-version plugin hooks
      await this.pluginManager.executeHook('post-version', {
        version: newVersion,
        previousVersion: currentVersion,
        config: this.config
      });

      // Run post-version hook
      this.runPostVersionHook();

      // Clean up rollback state on success
      this.rollback.cleanup();

      // Show success message with beautiful graphics
      showSuccess(newVersion);
      
      if (!this.config.autoPush) {
        console.log(`${colors.gray}📤 To publish these changes, run:${colors.reset}`);
        console.log(`   ${colors.brightCyan}git push origin HEAD${this.config.autoTag ? ' --tags' : ''}${colors.reset}`);
      }

      return newVersion;
    } catch (error) {
      // Rollback on error
      console.error(`${colors.red}❌ Error during version bump: ${error.message}${colors.reset}`);
      
      if (!options.dryRun) {
        console.log(`${colors.yellow}🔄 Attempting rollback...${colors.reset}`);
        try {
          await this.rollback.rollback();
        } catch (rollbackError) {
          console.error(`${colors.red}❌ Rollback failed: ${rollbackError.message}${colors.reset}`);
        }
      }
      
      throw error;
    }
  }

  // New utility methods for enhanced features
  getCurrentVersion(packagePath) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version;
  }

  async bumpVersionOnly(versionType, options = {}) {
    const packagePath = this.checkPackageJson();

    // Calculate new version
    const currentPackageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const currentVersion = currentPackageJson.version;

    let newVersion;
    if (versionType === 'prerelease') {
      newVersion = this.versionStrategies.prereleaseStrategy(
        currentVersion,
        'patch',
        options.preid || 'alpha'
      );
    } else if (this.config.versionStrategy) {
      const strategy = this.versionStrategies.getStrategy(this.config.versionStrategy);
      newVersion = strategy(currentVersion, versionType);
    } else {
      newVersion = this.versionStrategies.semverStrategy(currentVersion, versionType);
    }

    // Show the release box (unless quiet mode)
    if (!options.quiet) {
      console.log(createReleaseBox(versionType, currentVersion, newVersion));
    }

    // Dry run mode
    if (options.dryRun) {
      console.log(`\n${colors.brightYellow}🔍 DRY RUN MODE${colors.reset}`);
      console.log(`  • Version: ${currentVersion} → ${colors.green}${newVersion}${colors.reset}`);
      console.log(`${colors.gray}No changes were made. Remove --dry-run to execute.${colors.reset}`);
      return newVersion;
    }

    // Update package.json
    if (!options.quiet) {
      console.log(`${colors.brightYellow}🍋 Bumping ${versionType} version...${colors.reset}`);
    }
    currentPackageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(currentPackageJson, null, 2) + '\n');
    if (!options.quiet) {
      console.log(`${colors.green}✓ Updated package.json${colors.reset}`);
    }

    // Update package-lock.json if it exists
    const lockPath = path.join(process.cwd(), 'package-lock.json');
    if (fs.existsSync(lockPath)) {
      try {
        const lockJson = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
        lockJson.version = newVersion;
        if (lockJson.packages && lockJson.packages['']) {
          lockJson.packages[''].version = newVersion;
        }
        fs.writeFileSync(lockPath, JSON.stringify(lockJson, null, 2) + '\n');
        console.log(`${colors.green}✓ Updated package-lock.json${colors.reset}`);
      } catch (error) {
        console.warn(`${colors.yellow}⚠️  Could not update package-lock.json${colors.reset}`);
      }
    }

    // Show success message
    if (!options.quiet) {
      showSuccess(newVersion, { committed: false, tagged: false, pushed: false });
    } else {
      console.log(newVersion);
    }

    return newVersion;
  }

  async bumpWithCommit(versionType, options = {}) {
    // Check git repo is required for commit operations
    this.checkGitRepo();

    const packagePath = this.checkPackageJson();

    // Run pre-version hook
    if (!options.dryRun) {
      this.runPreVersionHook();
    }

    // Calculate new version
    const currentPackageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const currentVersion = currentPackageJson.version;

    let newVersion;
    if (versionType === 'prerelease') {
      newVersion = this.versionStrategies.prereleaseStrategy(
        currentVersion,
        'patch',
        options.preid || 'alpha'
      );
    } else if (this.config.versionStrategy) {
      const strategy = this.versionStrategies.getStrategy(this.config.versionStrategy);
      newVersion = strategy(currentVersion, versionType);
    } else {
      newVersion = this.versionStrategies.semverStrategy(currentVersion, versionType);
    }

    // Show the release box (unless quiet mode)
    if (!options.quiet) {
      console.log(createReleaseBox(versionType, currentVersion, newVersion));
    }

    // Get commit message
    const customMessage = await this.promptForMessage(newVersion, versionType);
    const commitMessage = this.formatCommitMessage(customMessage, newVersion);

    // Dry run mode
    if (options.dryRun) {
      console.log(`\n${colors.brightYellow}🔍 DRY RUN MODE${colors.reset}`);
      console.log(`  • Version: ${currentVersion} → ${colors.green}${newVersion}${colors.reset}`);
      console.log(`  • Commit message:\n${colors.gray}${commitMessage.split('\n').map(l => '    ' + l).join('\n')}${colors.reset}`);
      console.log(`${colors.gray}No changes were made. Remove --dry-run to execute.${colors.reset}`);
      return newVersion;
    }

    // Update package.json
    if (!options.quiet) {
      console.log(`${colors.brightYellow}🍋 Bumping ${versionType} version...${colors.reset}`);
    }
    currentPackageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(currentPackageJson, null, 2) + '\n');
    if (!options.quiet) {
      console.log(`${colors.green}✓ Updated package.json${colors.reset}`);
    }

    // Update package-lock.json if it exists
    const lockPath = path.join(process.cwd(), 'package-lock.json');
    if (fs.existsSync(lockPath)) {
      try {
        const lockJson = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
        lockJson.version = newVersion;
        if (lockJson.packages && lockJson.packages['']) {
          lockJson.packages[''].version = newVersion;
        }
        fs.writeFileSync(lockPath, JSON.stringify(lockJson, null, 2) + '\n');
      } catch (error) {
        console.warn(`${colors.yellow}⚠️  Could not update package-lock.json${colors.reset}`);
      }
    }

    // Stage changes
    console.log(`${colors.cyan}📦 Staging changes...${colors.reset}`);
    execSync('git add package.json package-lock.json');

    // Create commit
    console.log(`${colors.cyan}💾 Creating version commit...${colors.reset}`);
    execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);

    // Run post-version hook
    this.runPostVersionHook();

    // Show success message
    if (!options.quiet) {
      showSuccess(newVersion, { committed: true, tagged: false, pushed: false });
      console.log(`${colors.gray}📤 To publish these changes, run:${colors.reset}`);
      console.log(`   ${colors.brightCyan}git push origin HEAD${colors.reset}`);
    } else {
      console.log(newVersion);
    }

    return newVersion;
  }

  async bumpWithTag(versionType, options = {}) {
    // Check git repo is required for tag operations
    this.checkGitRepo();

    const packagePath = this.checkPackageJson();

    // Run pre-version hook
    if (!options.dryRun) {
      this.runPreVersionHook();
    }

    // Calculate new version
    const currentPackageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const currentVersion = currentPackageJson.version;

    let newVersion;
    if (versionType === 'prerelease') {
      newVersion = this.versionStrategies.prereleaseStrategy(
        currentVersion,
        'patch',
        options.preid || 'alpha'
      );
    } else if (this.config.versionStrategy) {
      const strategy = this.versionStrategies.getStrategy(this.config.versionStrategy);
      newVersion = strategy(currentVersion, versionType);
    } else {
      newVersion = this.versionStrategies.semverStrategy(currentVersion, versionType);
    }

    // Show the release box (unless quiet mode)
    if (!options.quiet) {
      console.log(createReleaseBox(versionType, currentVersion, newVersion));
    }

    // Get commit message
    const customMessage = await this.promptForMessage(newVersion, versionType);
    const commitMessage = this.formatCommitMessage(customMessage, newVersion);

    // Dry run mode
    if (options.dryRun) {
      console.log(`\n${colors.brightYellow}🔍 DRY RUN MODE${colors.reset}`);
      console.log(`  • Version: ${currentVersion} → ${colors.green}${newVersion}${colors.reset}`);
      console.log(`  • Commit message:\n${colors.gray}${commitMessage.split('\n').map(l => '    ' + l).join('\n')}${colors.reset}`);
      console.log(`  • Would create tag: ${colors.cyan}v${newVersion}${colors.reset}`);
      console.log(`${colors.gray}No changes were made. Remove --dry-run to execute.${colors.reset}`);
      return newVersion;
    }

    // Update package.json
    if (!options.quiet) {
      console.log(`${colors.brightYellow}🍋 Bumping ${versionType} version...${colors.reset}`);
    }
    currentPackageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(currentPackageJson, null, 2) + '\n');
    if (!options.quiet) {
      console.log(`${colors.green}✓ Updated package.json${colors.reset}`);
    }

    // Update package-lock.json if it exists
    const lockPath = path.join(process.cwd(), 'package-lock.json');
    if (fs.existsSync(lockPath)) {
      try {
        const lockJson = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
        lockJson.version = newVersion;
        if (lockJson.packages && lockJson.packages['']) {
          lockJson.packages[''].version = newVersion;
        }
        fs.writeFileSync(lockPath, JSON.stringify(lockJson, null, 2) + '\n');
      } catch (error) {
        console.warn(`${colors.yellow}⚠️  Could not update package-lock.json${colors.reset}`);
      }
    }

    // Stage changes
    console.log(`${colors.cyan}📦 Staging changes...${colors.reset}`);
    execSync('git add package.json package-lock.json');

    // Create commit
    console.log(`${colors.cyan}💾 Creating version commit...${colors.reset}`);
    execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);

    // Create tag
    console.log(`${colors.cyan}🏷️  Creating version tag...${colors.reset}`);
    execSync(`git tag -a "v${newVersion}" -m "Version ${newVersion}"`);

    // Run post-version hook
    this.runPostVersionHook();

    // Show success message
    if (!options.quiet) {
      showSuccess(newVersion, { committed: true, tagged: true, pushed: false });
      console.log(`${colors.gray}📤 To publish these changes, run:${colors.reset}`);
      console.log(`   ${colors.brightCyan}git push origin HEAD --tags${colors.reset}`);
    } else {
      console.log(newVersion);
    }

    return newVersion;
  }

  async bumpWithPush(versionType, options = {}) {
    // Determine if we should tag based on config
    const shouldTag = this.config.autoTag !== false;

    if (shouldTag) {
      // Check git repo is required for push operations
      this.checkGitRepo();

      const packagePath = this.checkPackageJson();

      // Run pre-version hook
      if (!options.dryRun) {
        this.runPreVersionHook();
      }

      // Calculate new version
      const currentPackageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const currentVersion = currentPackageJson.version;

      let newVersion;
      if (versionType === 'prerelease') {
        newVersion = this.versionStrategies.prereleaseStrategy(
          currentVersion,
          'patch',
          options.preid || 'alpha'
        );
      } else if (this.config.versionStrategy) {
        const strategy = this.versionStrategies.getStrategy(this.config.versionStrategy);
        newVersion = strategy(currentVersion, versionType);
      } else {
        newVersion = this.versionStrategies.semverStrategy(currentVersion, versionType);
      }

      // Show the release box (unless quiet mode)
      if (!options.quiet) {
        console.log(createReleaseBox(versionType, currentVersion, newVersion));
      }

      // Get commit message
      const customMessage = await this.promptForMessage(newVersion, versionType);
      const commitMessage = this.formatCommitMessage(customMessage, newVersion);

      // Dry run mode
      if (options.dryRun) {
        console.log(`\n${colors.brightYellow}🔍 DRY RUN MODE${colors.reset}`);
        console.log(`  • Version: ${currentVersion} → ${colors.green}${newVersion}${colors.reset}`);
        console.log(`  • Commit message:\n${colors.gray}${commitMessage.split('\n').map(l => '    ' + l).join('\n')}${colors.reset}`);
        console.log(`  • Would create tag: ${colors.cyan}v${newVersion}${colors.reset}`);
        console.log(`  • Would push to remote`);
        console.log(`${colors.gray}No changes were made. Remove --dry-run to execute.${colors.reset}`);
        return newVersion;
      }

      // Update package.json
      console.log(`${colors.brightYellow}🍋 Bumping ${versionType} version...${colors.reset}`);
      currentPackageJson.version = newVersion;
      fs.writeFileSync(packagePath, JSON.stringify(currentPackageJson, null, 2) + '\n');
      if (!options.quiet) {
        console.log(`${colors.green}✓ Updated package.json${colors.reset}`);
      }

      // Update package-lock.json if it exists
      const lockPath = path.join(process.cwd(), 'package-lock.json');
      if (fs.existsSync(lockPath)) {
        try {
          const lockJson = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
          lockJson.version = newVersion;
          if (lockJson.packages && lockJson.packages['']) {
            lockJson.packages[''].version = newVersion;
          }
          fs.writeFileSync(lockPath, JSON.stringify(lockJson, null, 2) + '\n');
        } catch (error) {
          console.warn(`${colors.yellow}⚠️  Could not update package-lock.json${colors.reset}`);
        }
      }

      // Stage changes
      console.log(`${colors.cyan}📦 Staging changes...${colors.reset}`);
      execSync('git add package.json package-lock.json');

      // Create commit
      console.log(`${colors.cyan}💾 Creating version commit...${colors.reset}`);
      execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);

      // Create tag
      console.log(`${colors.cyan}🏷️  Creating version tag...${colors.reset}`);
      execSync(`git tag -a "v${newVersion}" -m "Version ${newVersion}"`);

      // Push to remote
      console.log(`${colors.cyan}📤 Pushing to remote...${colors.reset}`);
      execSync('git push origin HEAD --tags');

      // Run post-version hook
      this.runPostVersionHook();

      // Show success message
      if (!options.quiet) {
        showSuccess(newVersion, { committed: true, tagged: true, pushed: true });
      } else {
        console.log(newVersion);
      }

      return newVersion;
    } else {
      // Without tag - just commit and push
      this.checkGitRepo();

      const packagePath = this.checkPackageJson();

      // Run pre-version hook
      if (!options.dryRun) {
        this.runPreVersionHook();
      }

      // Calculate new version
      const currentPackageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const currentVersion = currentPackageJson.version;

      let newVersion;
      if (versionType === 'prerelease') {
        newVersion = this.versionStrategies.prereleaseStrategy(
          currentVersion,
          'patch',
          options.preid || 'alpha'
        );
      } else if (this.config.versionStrategy) {
        const strategy = this.versionStrategies.getStrategy(this.config.versionStrategy);
        newVersion = strategy(currentVersion, versionType);
      } else {
        newVersion = this.versionStrategies.semverStrategy(currentVersion, versionType);
      }

      // Show the release box (unless quiet mode)
      if (!options.quiet) {
        console.log(createReleaseBox(versionType, currentVersion, newVersion));
      }

      // Get commit message
      const customMessage = await this.promptForMessage(newVersion, versionType);
      const commitMessage = this.formatCommitMessage(customMessage, newVersion);

      // Dry run mode
      if (options.dryRun) {
        console.log(`\n${colors.brightYellow}🔍 DRY RUN MODE${colors.reset}`);
        console.log(`  • Version: ${currentVersion} → ${colors.green}${newVersion}${colors.reset}`);
        console.log(`  • Commit message:\n${colors.gray}${commitMessage.split('\n').map(l => '    ' + l).join('\n')}${colors.reset}`);
        console.log(`  • Would push to remote`);
        console.log(`${colors.gray}No changes were made. Remove --dry-run to execute.${colors.reset}`);
        return newVersion;
      }

      // Update package.json
      console.log(`${colors.brightYellow}🍋 Bumping ${versionType} version...${colors.reset}`);
      currentPackageJson.version = newVersion;
      fs.writeFileSync(packagePath, JSON.stringify(currentPackageJson, null, 2) + '\n');
      if (!options.quiet) {
        console.log(`${colors.green}✓ Updated package.json${colors.reset}`);
      }

      // Update package-lock.json if it exists
      const lockPath = path.join(process.cwd(), 'package-lock.json');
      if (fs.existsSync(lockPath)) {
        try {
          const lockJson = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
          lockJson.version = newVersion;
          if (lockJson.packages && lockJson.packages['']) {
            lockJson.packages[''].version = newVersion;
          }
          fs.writeFileSync(lockPath, JSON.stringify(lockJson, null, 2) + '\n');
        } catch (error) {
          console.warn(`${colors.yellow}⚠️  Could not update package-lock.json${colors.reset}`);
        }
      }

      // Stage changes
      console.log(`${colors.cyan}📦 Staging changes...${colors.reset}`);
      execSync('git add package.json package-lock.json');

      // Create commit
      console.log(`${colors.cyan}💾 Creating version commit...${colors.reset}`);
      execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);

      // Push to remote
      console.log(`${colors.cyan}📤 Pushing to remote...${colors.reset}`);
      execSync('git push origin HEAD');

      // Run post-version hook
      this.runPostVersionHook();

      // Show success message
      if (!options.quiet) {
        showSuccess(newVersion, { committed: true, tagged: false, pushed: true });
      } else {
        console.log(newVersion);
      }

      return newVersion;
    }
  }

  getUncommittedFiles() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      return status.trim().split('\n').map(line => line.substring(3)).filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  async handleUncommittedChanges(options) {
    const files = this.getUncommittedFiles();
    
    if (files.length === 0) {
      return;
    }

    console.log(`${colors.yellow}📝 Uncommitted changes detected:${colors.reset}`);
    
    if (options.stash) {
      console.log(`${colors.cyan}📚 Stashing changes...${colors.reset}`);
      execSync('git stash push -m "CitrusVer: pre-version stash"');
      return { stashed: true };
    }
    
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    const lines = gitStatus.trim().split('\n');
    
    lines.forEach(line => {
      const [status, file] = [line.substring(0, 2), line.substring(3)];
      const statusMap = {
        'M ': '  [M]', ' M': '  [M]', 'MM': '  [M]',
        'A ': '  [A]', ' A': '  [A]', 'AM': '  [A]',
        'D ': '  [D]', ' D': '  [D]',
        '??': '  [?]', '!!': '  [!]'
      };
      const statusStr = statusMap[status] || `  [${status}]`;
      console.log(`${colors.gray}${statusStr} ${file}${colors.reset}`);
    });
    
    console.log(`${colors.cyan}✨ All changes will be included in the version commit${colors.reset}\n`);
  }

  async showDryRun(details) {
    console.log(`\n${colors.brightYellow}🔍 DRY RUN MODE${colors.reset}\n`);
    console.log(`${colors.cyan}What would happen:${colors.reset}\n`);
    
    console.log(`  • Version: ${details.currentVersion} → ${colors.green}${details.newVersion}${colors.reset}`);
    console.log(`  • Type: ${details.versionType}`);
    
    if (details.files && details.files.length > 0) {
      console.log(`  • Files to commit: ${details.files.length} files`);
    }
    
    console.log(`  • Commit message:\n${colors.gray}${details.commitMessage.split('\n').map(l => '    ' + l).join('\n')}${colors.reset}`);
    
    if (details.wouldTag) {
      console.log(`  • Would create tag: ${colors.cyan}v${details.newVersion}${colors.reset}`);
    }
    
    if (details.wouldPush) {
      console.log(`  • Would push to remote: ${colors.cyan}origin${colors.reset}`);
    }
    
    if (details.changelog) {
      console.log(`  • Would generate CHANGELOG.md`);
    }
    
    console.log(`\n${colors.gray}No changes were made. Remove --dry-run to execute.${colors.reset}`);
  }
}

module.exports = CitrusVer;
