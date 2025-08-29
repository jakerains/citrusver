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

const versionTypeGraphics = {
  patch: `
            ${colors.brightGreen}========================================${colors.reset}
                    ${colors.brightGreen}🐛 PATCH RELEASE 🐛${colors.reset}
                  ${colors.gray}Bug fixes and patches${colors.reset}
                    
               ${colors.gray}Version: 1.0.0${colors.reset} → ${colors.gray}1.0.${colors.brightGreen}${colors.bright}1${colors.reset}
            ${colors.brightGreen}========================================${colors.reset}
  `,
  minor: `
            ${colors.brightYellow}========================================${colors.reset}
                    ${colors.brightYellow}✨ MINOR RELEASE ✨${colors.reset}
               ${colors.gray}New features and additions${colors.reset}
                    
               ${colors.gray}Version: 1.0.0${colors.reset} → ${colors.gray}1.${colors.brightYellow}${colors.bright}1${colors.reset}${colors.gray}.0${colors.reset}
            ${colors.brightYellow}========================================${colors.reset}
  `,
  major: `
            ${colors.brightMagenta}========================================${colors.reset}
                    ${colors.brightMagenta}💥 MAJOR RELEASE 💥${colors.reset}
                ${colors.gray}Breaking changes ahead!${colors.reset}
                    
               ${colors.gray}Version: 1.0.0${colors.reset} → ${colors.brightMagenta}${colors.bright}2${colors.reset}${colors.gray}.0.0${colors.reset}
            ${colors.brightMagenta}========================================${colors.reset}
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
  showLemonAnimation,
  colorize,
  showSuccess
};