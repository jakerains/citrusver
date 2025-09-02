const readline = require('readline');
const { colors } = require('../ascii-art');

class InteractiveMode {
  constructor() {
    this.commitTypes = {
      feat: { emoji: '✨', description: 'A new feature' },
      fix: { emoji: '🐛', description: 'A bug fix' },
      docs: { emoji: '📚', description: 'Documentation changes' },
      style: { emoji: '💅', description: 'Code style changes (formatting, etc)' },
      refactor: { emoji: '♻️', description: 'Code refactoring' },
      perf: { emoji: '⚡', description: 'Performance improvements' },
      test: { emoji: '🧪', description: 'Adding or updating tests' },
      build: { emoji: '🔨', description: 'Build system changes' },
      ci: { emoji: '👷', description: 'CI/CD changes' },
      chore: { emoji: '🔧', description: 'Other changes' },
      revert: { emoji: '⏪', description: 'Reverting changes' }
    };
  }

  async getCommitDetails(version, options = {}) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Enable raw mode for better key handling
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    const details = {};

    try {
      // Get commit type if conventional commits enabled
      if (options.conventionalCommits) {
        details.type = await this.selectCommitType(rl);
        
        // Get scope if needed
        details.scope = await this.getScope(rl);
        
        // Check for breaking change
        details.breaking = await this.isBreakingChange(rl);
      }
      
      // Get commit message
      details.message = await this.getMessage(rl, version);
      
      // Get detailed description if needed
      if (details.breaking || options.detailedDescription) {
        details.description = await this.getDescription(rl);
      }
      
      return details;
    } finally {
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      rl.close();
    }
  }

  async selectCommitType(rl) {
    console.log(`\n${colors.cyan}Select commit type:${colors.reset}\n`);
    
    const types = Object.entries(this.commitTypes);
    types.forEach(([type, info], index) => {
      const num = String(index + 1).padStart(2, ' ');
      console.log(`  ${colors.green}${num}${colors.reset}. ${info.emoji}  ${colors.yellow}${type.padEnd(10)}${colors.reset} ${colors.gray}${info.description}${colors.reset}`);
    });
    
    return new Promise((resolve) => {
      const handleKeypress = (chunk) => {
        const key = chunk.toString();
        
        // Handle ESC
        if (key === '\u001b') {
          console.log(`\n${colors.gray}Cancelled${colors.reset}`);
          process.exit(0);
        }
        
        // Handle Enter (default to feat)
        if (key === '\r' || key === '\n') {
          process.stdin.removeListener('data', handleKeypress);
          resolve('feat');
          return;
        }
        
        // Handle number selection
        const num = parseInt(key);
        if (num >= 1 && num <= types.length) {
          process.stdin.removeListener('data', handleKeypress);
          resolve(types[num - 1][0]);
        }
      };
      
      process.stdin.on('data', handleKeypress);
      process.stdout.write(`\n${colors.cyan}Choose (1-${types.length}, Enter for feat, Esc to cancel): ${colors.reset}`);
    });
  }

  async getScope(rl) {
    return new Promise((resolve) => {
      rl.question(`\n${colors.cyan}Scope${colors.reset} ${colors.gray}(optional, e.g., api, ui, auth):${colors.reset} `, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async isBreakingChange(rl) {
    return new Promise((resolve) => {
      rl.question(`\n${colors.yellow}Is this a breaking change?${colors.reset} (y/N): `, (answer) => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
  }

  async getMessage(rl, version) {
    return new Promise((resolve) => {
      const prompt = `\n${colors.cyan}Commit message for ${colors.green}v${version}${colors.reset} ${colors.gray}(required):${colors.reset} `;
      
      rl.question(prompt, (answer) => {
        if (!answer.trim()) {
          console.log(`${colors.red}❌ Commit message is required${colors.reset}`);
          process.exit(1);
        }
        resolve(answer.trim());
      });
    });
  }

  async getDescription(rl) {
    console.log(`\n${colors.cyan}Additional description${colors.reset} ${colors.gray}(optional, press Enter twice to finish):${colors.reset}`);
    
    return new Promise((resolve) => {
      const lines = [];
      let emptyLineCount = 0;
      
      const handleLine = (line) => {
        if (line === '') {
          emptyLineCount++;
          if (emptyLineCount >= 2) {
            rl.removeListener('line', handleLine);
            resolve(lines.join('\n').trim());
          } else {
            lines.push(line);
          }
        } else {
          emptyLineCount = 0;
          lines.push(line);
        }
      };
      
      rl.on('line', handleLine);
    });
  }

  formatCommitMessage(details, version, template) {
    let message = template || '{{message}}\n\nv{{version}}';
    
    // Build conventional commit format
    if (details.type) {
      const typePrefix = details.type;
      const scope = details.scope ? `(${details.scope})` : '';
      const breaking = details.breaking ? '!' : '';
      
      message = `${typePrefix}${scope}${breaking}: {{message}}`;
      
      if (details.description) {
        message += `\n\n${details.description}`;
      }
      
      if (details.breaking) {
        message += '\n\nBREAKING CHANGE: {{message}}';
      }
      
      message += '\n\nv{{version}}';
    }
    
    // Replace placeholders
    message = message
      .replace(/{{message}}/g, details.message)
      .replace(/{{version}}/g, version)
      .replace(/{{type}}/g, details.type || '')
      .replace(/{{scope}}/g, details.scope ? `(${details.scope})` : '');
    
    return message;
  }

  async confirmRelease(summary) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(`\n${colors.brightYellow}📋 Release Summary:${colors.reset}\n`);
    console.log(`  ${colors.cyan}Version:${colors.reset} ${summary.currentVersion} → ${colors.green}${summary.newVersion}${colors.reset}`);
    console.log(`  ${colors.cyan}Type:${colors.reset} ${summary.versionType}`);
    
    if (summary.commitType) {
      console.log(`  ${colors.cyan}Commit Type:${colors.reset} ${summary.commitType}`);
    }
    
    if (summary.breaking) {
      console.log(`  ${colors.red}⚠️  BREAKING CHANGE${colors.reset}`);
    }
    
    if (summary.files && summary.files.length > 0) {
      console.log(`  ${colors.cyan}Files to commit:${colors.reset} ${summary.files.length} files`);
      if (summary.files.length <= 10) {
        summary.files.forEach(file => {
          console.log(`    ${colors.gray}• ${file}${colors.reset}`);
        });
      }
    }
    
    if (summary.message) {
      console.log(`  ${colors.cyan}Message:${colors.reset} ${summary.message.split('\n')[0]}`);
    }
    
    return new Promise((resolve) => {
      rl.question(`\n${colors.green}Proceed with release?${colors.reset} (Y/n): `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase() !== 'n');
      });
    });
  }

  async selectFiles(files) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(`\n${colors.cyan}Select files to include in commit:${colors.reset}\n`);
    
    const selected = new Set(files.map((_, i) => i)); // All selected by default
    
    files.forEach((file, index) => {
      const mark = selected.has(index) ? colors.green + '✓' : ' ';
      console.log(`  ${mark} ${colors.reset}${index + 1}. ${file}`);
    });
    
    console.log(`\n${colors.gray}Enter numbers to toggle, 'a' for all, 'n' for none, Enter to confirm${colors.reset}`);
    
    return new Promise((resolve) => {
      const handleInput = (input) => {
        const trimmed = input.trim().toLowerCase();
        
        if (trimmed === '') {
          rl.close();
          resolve(files.filter((_, i) => selected.has(i)));
          return;
        }
        
        if (trimmed === 'a') {
          files.forEach((_, i) => selected.add(i));
        } else if (trimmed === 'n') {
          selected.clear();
        } else {
          const nums = trimmed.split(/[\s,]+/).map(n => parseInt(n) - 1);
          nums.forEach(n => {
            if (n >= 0 && n < files.length) {
              if (selected.has(n)) {
                selected.delete(n);
              } else {
                selected.add(n);
              }
            }
          });
        }
        
        // Redraw
        console.clear();
        console.log(`\n${colors.cyan}Select files to include in commit:${colors.reset}\n`);
        files.forEach((file, index) => {
          const mark = selected.has(index) ? colors.green + '✓' : ' ';
          console.log(`  ${mark} ${colors.reset}${index + 1}. ${file}`);
        });
        console.log(`\n${colors.gray}Enter numbers to toggle, 'a' for all, 'n' for none, Enter to confirm${colors.reset}`);
      };
      
      rl.on('line', handleInput);
      rl.prompt();
    });
  }
}

module.exports = InteractiveMode;