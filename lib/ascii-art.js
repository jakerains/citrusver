// ASCII art and color utilities for CitrusVer

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  blink: '\x1b[5m',
  
  // Colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  // Bright colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  
  // Background colors
  bgYellow: '\x1b[43m',
  bgGreen: '\x1b[42m',
  bgCyan: '\x1b[46m',
  bgBrightYellow: '\x1b[103m',
};

const lemonArt = `
${colors.brightYellow}      🍋
    ╱   ╲
   │  ◉  │
    ╲___╱${colors.reset}
`;

const smallLemon = `${colors.brightYellow}🍋${colors.reset}`;

const detailedLemon = `
                    ${colors.brightYellow}🍋 ${colors.bright}CITRUSVER${colors.reset} ${colors.brightYellow}🍋${colors.reset}
              ${colors.gray}Fresh squeezed version management${colors.reset}
`;

const citrusHeader = `

                    ${colors.brightYellow}🍋 ${colors.bright}CITRUSVER${colors.reset} ${colors.brightYellow}🍋${colors.reset}
              ${colors.gray}Interactive Version Management${colors.reset}
`;

function createReleaseBox(type, currentVersion, nextVersion) {
  const icons = {
    patch: '🐛',
    minor: '✨', 
    major: '💥'
  };
  
  const typeColors = {
    patch: colors.yellow,
    minor: colors.cyan,
    major: colors.green
  };
  
  const color = typeColors[type];
  const icon = icons[type];
  const label = type.toUpperCase();
  
  return `╭──────────────────────────────────────────────╮
│  🍋 CitrusVer · ${label} RELEASE                │
├──────────────────────────────────────────────┤
│  Current   ${currentVersion.padEnd(34)}│
│  Next      ${color}${nextVersion}${colors.reset}${' '.repeat(34 - nextVersion.length)}│
│                                              │
│  ${colors.gray}Fresh-squeezed semver for your repo${colors.reset}         │
╰──────────────────────────────────────────────╯`;
}

const versionTypeGraphics = {
  patch: `deprecated - use createReleaseBox instead`,
  minor: `deprecated - use createReleaseBox instead`,
  major: `deprecated - use createReleaseBox instead`
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
            ${colors.brightGreen}========================================${colors.reset}
                  ${colors.brightGreen}✅ VERSION BUMPED! ✅${colors.reset}
            ${colors.brightGreen}========================================${colors.reset}
                    
                 ${colors.bright}New Version: ${colors.brightYellow}v${version}${colors.reset}
                    
            ${colors.gray}All changes have been committed${colors.reset}
               ${colors.gray}Git tag has been created${colors.reset}
                    
            ${colors.brightGreen}----------------------------------------${colors.reset}
                    
                    ${colors.bright}Next Step:${colors.reset}
            ${colors.brightCyan}git push origin HEAD --tags${colors.reset}
                    
            ${colors.brightYellow}🍋 Fresh release squeezed! 🍋${colors.reset}
  `);
}

module.exports = {
  colors,
  lemonArt,
  smallLemon,
  detailedLemon,
  citrusHeader,
  versionTypeGraphics,
  createReleaseBox,
  showLemonAnimation,
  colorize,
  showSuccess
};