const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { colors } = require('../ascii-art');

class InitCommand {
  constructor() {
    this.templates = {
      default: {
        messageStyle: 'interactive',
        autoTag: true,
        autoPush: false,
        confirmRelease: true,
        changelog: false,
        branch: {
          protected: ['main', 'master'],
          allowForce: false
        }
      },
      conventional: {
        messageStyle: 'interactive',
        autoTag: true,
        autoPush: false,
        confirmRelease: true,
        changelog: true,
        conventionalCommits: true,
        commitTypes: ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
        commitTemplate: '{{type}}{{scope}}: {{message}}\n\nv{{version}}',
        branch: {
          protected: ['main', 'master', 'develop'],
          allowForce: false
        }
      },
      'semantic-release': {
        messageStyle: 'interactive',
        autoTag: true,
        autoPush: true,
        confirmRelease: false,
        changelog: true,
        conventionalCommits: true,
        npm: {
          publish: true,
          access: 'public'
        },
        commitTemplate: 'chore(release): {{version}}\n\n{{changelog}}',
        branch: {
          protected: ['main', 'master'],
          allowForce: false,
          releaseBranches: ['main', 'master', 'next', 'beta', 'alpha']
        }
      },
      monorepo: {
        messageStyle: 'interactive',
        autoTag: true,
        autoPush: false,
        confirmRelease: true,
        changelog: true,
        monorepo: {
          enabled: true,
          packages: 'packages/*',
          independent: false,
          syncVersions: true
        },
        commitTemplate: 'chore: release {{packages}}\n\n{{changes}}',
        branch: {
          protected: ['main', 'master'],
          allowForce: false
        }
      },
      minimal: {
        messageStyle: 'simple',
        autoTag: false,
        autoPush: false,
        confirmRelease: false,
        changelog: false
      }
    };
  }

  async run(options) {
    console.log(`\n${colors.brightYellow}🍋 CitrusVer Configuration Setup${colors.reset}\n`);
    
    const configPath = path.join(process.cwd(), '.citrusver.json');
    
    // Check if config already exists
    if (fs.existsSync(configPath) && !options.force) {
      console.log(`${colors.yellow}⚠️  Configuration file already exists${colors.reset}`);
      const overwrite = await this.confirm('Do you want to overwrite it?');
      if (!overwrite) {
        console.log(`${colors.gray}Configuration setup cancelled${colors.reset}`);
        return;
      }
    }
    
    let config;
    
    if (options.template) {
      // Use specified template
      config = this.templates[options.template];
      if (!config) {
        console.error(`❌ Unknown template: ${options.template}`);
        console.log(`Available templates: ${Object.keys(this.templates).join(', ')}`);
        process.exit(1);
      }
    } else {
      // Interactive setup
      config = await this.interactiveSetup();
    }
    
    // Add custom fields
    config = await this.addCustomFields(config);
    
    // Write config file
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`\n✅ ${colors.green}Configuration saved to .citrusver.json${colors.reset}`);
    
    // Create .gitignore entry if needed
    this.updateGitignore();
    
    // Show summary
    this.showSummary(config);
  }

  async interactiveSetup() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise((resolve) => {
      rl.question(prompt, resolve);
    });

    console.log('Choose a configuration template:\n');
    Object.entries(this.templates).forEach(([name, config], index) => {
      console.log(`  ${colors.cyan}${index + 1}${colors.reset}. ${name}`);
      if (name === 'default') console.log(`     ${colors.gray}Basic configuration with sensible defaults${colors.reset}`);
      if (name === 'conventional') console.log(`     ${colors.gray}For projects using conventional commits${colors.reset}`);
      if (name === 'semantic-release') console.log(`     ${colors.gray}Automated releases with semantic versioning${colors.reset}`);
      if (name === 'monorepo') console.log(`     ${colors.gray}For monorepo projects with multiple packages${colors.reset}`);
      if (name === 'minimal') console.log(`     ${colors.gray}Minimal configuration, no extras${colors.reset}`);
    });

    const choice = await question(`\nSelect template (1-${Object.keys(this.templates).length}): `);
    rl.close();

    const templateNames = Object.keys(this.templates);
    const templateIndex = parseInt(choice) - 1;
    
    if (templateIndex >= 0 && templateIndex < templateNames.length) {
      return { ...this.templates[templateNames[templateIndex]] };
    }
    
    return { ...this.templates.default };
  }

  async addCustomFields(config) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise((resolve) => {
      rl.question(prompt, resolve);
    });

    console.log(`\n${colors.cyan}Additional configuration:${colors.reset}\n`);
    
    // Pre/post version hooks
    const preVersion = await question('Pre-version command (e.g., "npm test"): ');
    if (preVersion.trim()) {
      config.preVersion = preVersion.trim();
    }
    
    const postVersion = await question('Post-version command (e.g., "npm run build"): ');
    if (postVersion.trim()) {
      config.postVersion = postVersion.trim();
    }
    
    // Auto push
    const autoPushAnswer = await question('Automatically push after version bump? (y/N): ');
    config.autoPush = autoPushAnswer.toLowerCase() === 'y';
    
    // Changelog
    const changelogAnswer = await question('Generate CHANGELOG.md automatically? (y/N): ');
    config.changelog = changelogAnswer.toLowerCase() === 'y';
    
    rl.close();
    return config;
  }

  async confirm(message) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(`${message} (y/N): `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y');
      });
    });
  }

  updateGitignore() {
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    
    if (!fs.existsSync(gitignorePath)) {
      return;
    }
    
    const content = fs.readFileSync(gitignorePath, 'utf8');
    const lines = content.split('\n');
    
    // Check if .citrusver directory should be ignored
    if (!lines.includes('.citrusver/')) {
      lines.push('', '# CitrusVer', '.citrusver/');
      fs.writeFileSync(gitignorePath, lines.join('\n'));
    }
  }

  showSummary(config) {
    console.log(`\n${colors.brightYellow}Configuration Summary:${colors.reset}\n`);
    console.log(`  ${colors.green}✓${colors.reset} Message style: ${config.messageStyle}`);
    console.log(`  ${colors.green}✓${colors.reset} Auto-tag: ${config.autoTag}`);
    console.log(`  ${colors.green}✓${colors.reset} Auto-push: ${config.autoPush}`);
    console.log(`  ${colors.green}✓${colors.reset} Changelog: ${config.changelog || false}`);
    
    if (config.preVersion) {
      console.log(`  ${colors.green}✓${colors.reset} Pre-version: ${config.preVersion}`);
    }
    if (config.postVersion) {
      console.log(`  ${colors.green}✓${colors.reset} Post-version: ${config.postVersion}`);
    }
    
    console.log(`\n${colors.gray}You can now use: citrusver patch/minor/major${colors.reset}`);
  }
}

module.exports = InitCommand;