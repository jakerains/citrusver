// ASCII art and color utilities for CitrusVer

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Colors
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  // Bright colors
  brightYellow: '\x1b[93m',
  brightGreen: '\x1b[92m',
  brightCyan: '\x1b[96m',
};

const lemonArt = `
    ${colors.brightYellow}⠀⠀⠀⠀⠀⠀⢀⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⣠⣾⡿⠛⠛⢿⣷⣄⠀⠀⠀⠀⠀
    ⠀⠀⠀⣴⣿⠋⠀⠀⠀⠀⠙⣿⣦⠀⠀⠀⠀
    ⠀⠀⣸⣿⠃⠀⠀⠀⠀⠀⠀⠘⣿⣇⠀⠀⠀
    ⠀⢠⣿⡇⠀⠀${colors.brightGreen}🍋${colors.brightYellow}⠀⠀⠀⢸⣿⡄⠀⠀
    ⠀⣾⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣷⠀⠀
    ⢠⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⡄⠀
    ⣸⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣇⠀
    ⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⠀
    ⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⣿⠀
    ⠸⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⠇⠀
    ⠀⠹⣿⣧⡀⠀⠀⠀⠀⠀⠀⢀⣼⣿⠏⠀⠀
    ⠀⠀⠙⢿⣷⣦⣤⣤⣤⣤⣴⣾⡿⠋⠀⠀⠀
    ⠀⠀⠀⠀⠈⠙⠛⠿⠿⠛⠋⠁⠀⠀⠀⠀⠀${colors.reset}
`;

const smallLemon = `${colors.brightYellow}🍋${colors.reset}`;

const citrusHeader = `
${colors.brightYellow}╔═══════════════════════════════════════╗
║${colors.reset}  ${colors.brightGreen}${colors.bright}CitrusVer${colors.reset} ${colors.brightYellow}━${colors.reset} ${colors.cyan}Interactive Versioning${colors.reset}  ${colors.brightYellow}║
╚═══════════════════════════════════════╝${colors.reset}
`;

const versionTypeGraphics = {
  patch: `
    ${colors.cyan}╭─────────────────────────╮
    │  ${colors.brightGreen}PATCH${colors.reset} ${colors.gray}(Bug Fix)${colors.reset}       ${colors.cyan}│
    │  ${colors.gray}1.0.0 → 1.0.${colors.brightGreen}1${colors.reset}          ${colors.cyan}│
    ╰─────────────────────────╯${colors.reset}
  `,
  minor: `
    ${colors.cyan}╭─────────────────────────╮
    │  ${colors.brightYellow}MINOR${colors.reset} ${colors.gray}(Feature)${colors.reset}      ${colors.cyan}│
    │  ${colors.gray}1.0.0 → 1.${colors.brightYellow}1${colors.reset}${colors.gray}.0${colors.reset}          ${colors.cyan}│
    ╰─────────────────────────╯${colors.reset}
  `,
  major: `
    ${colors.cyan}╭─────────────────────────╮
    │  ${colors.brightCyan}MAJOR${colors.reset} ${colors.gray}(Breaking)${colors.reset}     ${colors.cyan}│
    │  ${colors.gray}1.0.0 → ${colors.brightCyan}2${colors.reset}${colors.gray}.0.0${colors.reset}          ${colors.cyan}│
    ╰─────────────────────────╯${colors.reset}
  `
};

function showLemonAnimation() {
  const frames = [
    `${colors.brightYellow}    🍋${colors.reset}`,
    `${colors.brightYellow}   🍋${colors.reset}`,
    `${colors.brightYellow}  🍋${colors.reset}`,
    `${colors.brightYellow} 🍋${colors.reset}`,
    `${colors.brightYellow}🍋${colors.reset}`,
    `${colors.brightGreen}✨${colors.brightYellow}🍋${colors.brightGreen}✨${colors.reset}`,
  ];

  let index = 0;
  const interval = setInterval(() => {
    process.stdout.write('\r' + frames[index]);
    index++;
    if (index >= frames.length) {
      clearInterval(interval);
      process.stdout.write('\r' + ' '.repeat(10) + '\r');
    }
  }, 150);
}

function colorize(text, color) {
  return `${colors[color] || ''}${text}${colors.reset}`;
}

function showSuccess(version) {
  console.log(`
${colors.brightGreen}╔═══════════════════════════════════════╗
║${colors.reset}         ${colors.brightGreen}✨ SUCCESS! ✨${colors.reset}               ${colors.brightGreen}║
║${colors.reset}                                       ${colors.brightGreen}║
║${colors.reset}   Version bumped to ${colors.brightYellow}v${version}${colors.reset}${' '.repeat(16 - version.length)}${colors.brightGreen}║
╚═══════════════════════════════════════╝${colors.reset}
  `);
}

module.exports = {
  colors,
  lemonArt,
  smallLemon,
  citrusHeader,
  versionTypeGraphics,
  showLemonAnimation,
  colorize,
  showSuccess
};