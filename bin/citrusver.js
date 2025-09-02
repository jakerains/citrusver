#!/usr/bin/env node

const CitrusVer = require('../lib/version-bump');
const { lemonArt, colors, citrusHeader } = require('../lib/ascii-art');
const UpdateChecker = require('../lib/update-check');
const pkg = require('../package.json');

function showHelp() {
  console.log(lemonArt);
  console.log(citrusHeader(pkg.version));
  console.log(`
${colors.brightYellow}Usage:${colors.reset}
  ${colors.cyan}citrusver${colors.reset} ${colors.green}<command>${colors.reset} ${colors.gray}[options]${colors.reset}

${colors.brightYellow}Commands:${colors.reset}
  ${colors.green}patch${colors.reset}       Increment patch version ${colors.gray}(1.0.0 → 1.0.1)${colors.reset}
  ${colors.green}minor${colors.reset}       Increment minor version ${colors.gray}(1.0.0 → 1.1.0)${colors.reset}
  ${colors.green}major${colors.reset}       Increment major version ${colors.gray}(1.0.0 → 2.0.0)${colors.reset}
  ${colors.green}prerelease${colors.reset}  Create prerelease version ${colors.gray}(1.0.0 → 1.0.1-alpha.0)${colors.reset}
  ${colors.green}init${colors.reset}        Initialize CitrusVer config

${colors.brightYellow}Options:${colors.reset}
  ${colors.green}-h, --help${colors.reset}         Show this help message
  ${colors.green}-v, --version${colors.reset}      Show CitrusVer version
  ${colors.green}--dry-run${colors.reset}          Preview changes without executing
  ${colors.green}--no-confirm${colors.reset}       Skip confirmation prompt
  ${colors.green}--changelog${colors.reset}        Generate CHANGELOG.md
  ${colors.green}--preid <id>${colors.reset}       Prerelease identifier (alpha, beta, rc)
  ${colors.green}--force${colors.reset}            Force operation on protected branches

${colors.brightYellow}Examples:${colors.reset}
  ${colors.cyan}npx citrusver patch --dry-run${colors.reset}
  ${colors.cyan}citrusver minor --changelog${colors.reset}
  ${colors.cyan}citrusver prerelease --preid beta${colors.reset}
  ${colors.cyan}citrusver init --template conventional${colors.reset}

${colors.brightYellow}Configuration:${colors.reset}
  Create a ${colors.green}.citrusver.json${colors.reset} file in your project root for custom settings.
  
${colors.gray}Learn more: https://github.com/jakerains/citrusver${colors.reset}
`);
}

function showVersion() {
  console.log(`CitrusVer v${pkg.version}`);
}

async function checkForUpdates() {
  const checker = new UpdateChecker('citrusver', pkg.version);
  const update = await checker.check();
  
  if (update) {
    console.log(checker.formatUpdateMessage(update.latestVersion));
  }
}

function parseArgs(args) {
  const options = {
    command: null,
    dryRun: false,
    noConfirm: false,
    changelog: false,
    preid: null,
    force: false,
    template: null,
    stash: false,
    selective: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--no-confirm') {
      options.noConfirm = true;
    } else if (arg === '--changelog') {
      options.changelog = true;
    } else if (arg === '--preid' && args[i + 1]) {
      options.preid = args[++i];
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--template' && args[i + 1]) {
      options.template = args[++i];
    } else if (arg === '--stash') {
      options.stash = true;
    } else if (arg === '--selective') {
      options.selective = true;
    } else if (!arg.startsWith('-') && !options.command) {
      options.command = arg;
    }
  }

  return options;
}

async function main() {
  const args = process.argv.slice(2);
  
  // Check for updates (fast, uses cache)
  await checkForUpdates().catch(() => {
    // Silently ignore any errors
  });

  // Handle help and version flags
  if (!args[0] || args[0] === '-h' || args[0] === '--help') {
    showHelp();
    return;
  }

  if (args[0] === '-v' || args[0] === '--version') {
    showVersion();
    return;
  }

  const options = parseArgs(args);
  const { command } = options;

  // Handle init command separately
  if (command === 'init') {
    const InitCommand = require('../lib/commands/init');
    const init = new InitCommand();
    await init.run(options);
    return;
  }

  // Validate version type
  const validTypes = ['patch', 'minor', 'major', 'prerelease'];
  if (!validTypes.includes(command)) {
    console.error(`❌ Invalid command: ${command}`);
    console.error(`Valid commands: ${validTypes.join(', ')}, init`);
    process.exit(1);
  }

  // Run version bump
  try {
    const citrusver = new CitrusVer();
    await citrusver.bump(command, options);
  } catch (error) {
    console.error('❌ CitrusVer failed:', error.message);
    process.exit(1);
  }
}

main();