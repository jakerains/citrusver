const { execSync } = require('child_process');
const UpdateChecker = require('../update-check');
const { colors } = require('../ascii-art');
const pkg = require('../../package.json');

class UpdateCommand {
  async run(options) {
    console.log(`\n${colors.brightYellow}🍋 CitrusVer Update Check${colors.reset}\n`);

    const checker = new UpdateChecker('citrusver', pkg.version);
    const update = await checker.check();

    if (!update) {
      console.log(`${colors.green}✓${colors.reset} You're already on the latest version (${pkg.version})`);
      return;
    }

    console.log(checker.formatUpdateMessage(update.latestVersion));

    // Check if installed globally
    const isGlobal = this.checkIfGlobal();

    if (isGlobal) {
      console.log(`\n${colors.cyan}Update options:${colors.reset}\n`);
      console.log(`  ${colors.green}1.${colors.reset} Automatic update (recommended)`);
      console.log(`  ${colors.green}2.${colors.reset} Manual update with npm\n`);

      if (options.auto || options.yes) {
        // Auto-update
        this.performUpdate();
      } else {
        // Show what to do
        console.log(`${colors.gray}To auto-update, run:${colors.reset}`);
        console.log(`  ${colors.brightCyan}citrusver update --auto${colors.reset}\n`);
        console.log(`${colors.gray}Or manually:${colors.reset}`);
        console.log(`  ${colors.brightCyan}npm install -g citrusver${colors.reset}\n`);
      }
    } else {
      console.log(`\n${colors.cyan}How to update:${colors.reset}\n`);
      console.log(`${colors.gray}If using npx (recommended for latest):${colors.reset}`);
      console.log(`  ${colors.brightCyan}npx citrusver@latest patch${colors.reset}`);
      console.log(`  ${colors.brightCyan}npx citrusver@latest minor${colors.reset}`);
      console.log(`  ${colors.brightCyan}npx citrusver@latest major${colors.reset}\n`);

      console.log(`${colors.gray}Or clear npm cache and use any version:${colors.reset}`);
      console.log(`  ${colors.brightCyan}npm cache clean --force${colors.reset}\n`);

      console.log(`${colors.gray}Or install globally:${colors.reset}`);
      console.log(`  ${colors.brightCyan}npm install -g citrusver@latest${colors.reset}\n`);
    }
  }

  checkIfGlobal() {
    try {
      // Check if npm can find citrusver globally
      const result = execSync('npm list -g citrusver', { encoding: 'utf8' });
      return !result.includes('not installed');
    } catch {
      return false;
    }
  }

  performUpdate() {
    try {
      console.log(`${colors.cyan}📦 Installing latest version...${colors.reset}`);
      execSync('npm install -g citrusver@latest', { stdio: 'inherit' });
      console.log(`\n${colors.green}✓ CitrusVer has been updated!${colors.reset}\n`);
    } catch (error) {
      console.error(`${colors.red}❌ Update failed: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }
}

module.exports = UpdateCommand;
