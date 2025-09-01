#!/usr/bin/env node

const CitrusVer = require('../lib/version-bump');
const { lemonArt, colors, citrusHeader } = require('../lib/ascii-art');
const UpdateChecker = require('../lib/update-check');
const pkg = require('../package.json');

function showHelp() {
  console.log(lemonArt);
  console.log(citrusHeader);
  console.log(`
${colors.brightYellow}Usage:${colors.reset}
  ${colors.cyan}citrusver${colors.reset} ${colors.green}<patch|minor|major>${colors.reset}

${colors.brightYellow}Commands:${colors.reset}
  ${colors.green}patch${colors.reset}    Increment patch version ${colors.gray}(1.0.0 → 1.0.1)${colors.reset}
  ${colors.green}minor${colors.reset}    Increment minor version ${colors.gray}(1.0.0 → 1.1.0)${colors.reset}
  ${colors.green}major${colors.reset}    Increment major version ${colors.gray}(1.0.0 → 2.0.0)${colors.reset}

${colors.brightYellow}Options:${colors.reset}
  ${colors.green}-h, --help${colors.reset}     Show this help message
  ${colors.green}-v, --version${colors.reset}  Show CitrusVer version

${colors.brightYellow}Examples:${colors.reset}
  ${colors.cyan}npx citrusver patch${colors.reset}
  ${colors.cyan}citrusver minor${colors.reset}
  ${colors.cyan}citrusver major${colors.reset}

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

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Check for updates (fast, uses cache)
  await checkForUpdates().catch(() => {
    // Silently ignore any errors
  });

  // Handle help and version flags
  if (!command || command === '-h' || command === '--help') {
    showHelp();
    return;
  }

  if (command === '-v' || command === '--version') {
    showVersion();
    return;
  }

  // Validate version type
  const validTypes = ['patch', 'minor', 'major'];
  if (!validTypes.includes(command)) {
    console.error(`❌ Invalid version type: ${command}`);
    console.error(`Valid types: ${validTypes.join(', ')}`);
    process.exit(1);
  }

  // Run version bump
  try {
    const citrusver = new CitrusVer();
    await citrusver.bump(command);
  } catch (error) {
    console.error('❌ CitrusVer failed:', error.message);
    process.exit(1);
  }
}

main();