const { execSync } = require('child_process');
const { colors } = require('../ascii-art');

class BranchProtection {
  constructor(config = {}) {
    this.config = {
      protected: config.protected || ['main', 'master'],
      allowForce: config.allowForce || false,
      releaseBranches: config.releaseBranches || ['main', 'master'],
      requireUpToDate: config.requireUpToDate !== false,
      autoCreateReleaseBranch: config.autoCreateReleaseBranch || false,
      ...config
    };
  }

  getCurrentBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (error) {
      return null;
    }
  }

  isProtectedBranch(branch = null) {
    const currentBranch = branch || this.getCurrentBranch();
    return this.config.protected.includes(currentBranch);
  }

  isReleaseBranch(branch = null) {
    const currentBranch = branch || this.getCurrentBranch();
    return this.config.releaseBranches.includes(currentBranch);
  }

  async checkBranchStatus(options = {}) {
    const results = {
      valid: true,
      warnings: [],
      errors: []
    };

    const currentBranch = this.getCurrentBranch();
    
    // Check if on protected branch
    if (this.isProtectedBranch(currentBranch) && !options.force && !this.config.allowForce) {
      results.warnings.push({
        type: 'protected-branch',
        message: `You're on protected branch '${currentBranch}'. Consider creating a release branch.`,
        branch: currentBranch
      });
    }

    // Check if branch is up to date with remote
    if (this.config.requireUpToDate) {
      const upToDate = this.isBranchUpToDate();
      if (!upToDate.isUpToDate) {
        results.errors.push({
          type: 'outdated-branch',
          message: `Branch '${currentBranch}' is ${upToDate.status} with remote.`,
          details: upToDate
        });
        results.valid = false;
      }
    }

    // Check for uncommitted changes (just warning, not error)
    const hasUncommitted = this.hasUncommittedChanges();
    if (hasUncommitted) {
      results.warnings.push({
        type: 'uncommitted-changes',
        message: 'You have uncommitted changes that will be included in the version commit.'
      });
    }

    // Check if we should suggest a release branch
    if (!this.isReleaseBranch(currentBranch) && !options.skipReleaseBranchCheck) {
      results.warnings.push({
        type: 'non-release-branch',
        message: `Branch '${currentBranch}' is not configured as a release branch.`,
        suggestion: 'Consider switching to a release branch or updating configuration.'
      });
    }

    return results;
  }

  isBranchUpToDate() {
    try {
      // Fetch latest from remote
      execSync('git fetch --quiet', { stdio: 'pipe' });
      
      const currentBranch = this.getCurrentBranch();
      const localCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      
      let remoteCommit;
      try {
        remoteCommit = execSync(`git rev-parse origin/${currentBranch}`, { 
          encoding: 'utf8' 
        }).trim();
      } catch (e) {
        // Remote branch doesn't exist
        return { isUpToDate: true, status: 'no-remote' };
      }

      if (localCommit === remoteCommit) {
        return { isUpToDate: true, status: 'up-to-date' };
      }

      // Check if local is ahead, behind, or diverged
      const ahead = parseInt(execSync(`git rev-list --count origin/${currentBranch}..HEAD`, {
        encoding: 'utf8'
      }).trim());
      
      const behind = parseInt(execSync(`git rev-list --count HEAD..origin/${currentBranch}`, {
        encoding: 'utf8'
      }).trim());

      if (ahead > 0 && behind > 0) {
        return { isUpToDate: false, status: 'diverged', ahead, behind };
      } else if (behind > 0) {
        return { isUpToDate: false, status: 'behind', behind };
      } else {
        return { isUpToDate: true, status: 'ahead', ahead };
      }
    } catch (error) {
      return { isUpToDate: true, status: 'unknown' };
    }
  }

  hasUncommittedChanges() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      return status.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  async createReleaseBranch(version, fromBranch = null) {
    const currentBranch = fromBranch || this.getCurrentBranch();
    const releaseBranchName = `release/v${version}`;

    try {
      // Check if branch already exists
      const branchExists = execSync(`git branch --list ${releaseBranchName}`, {
        encoding: 'utf8'
      }).trim();

      if (branchExists) {
        console.log(`${colors.yellow}⚠️  Release branch ${releaseBranchName} already exists${colors.reset}`);
        return { created: false, branch: releaseBranchName, reason: 'exists' };
      }

      // Create and checkout new branch
      execSync(`git checkout -b ${releaseBranchName}`, { stdio: 'pipe' });
      console.log(`${colors.green}✅ Created release branch: ${releaseBranchName}${colors.reset}`);
      
      return { created: true, branch: releaseBranchName };
    } catch (error) {
      console.error(`${colors.red}❌ Failed to create release branch: ${error.message}${colors.reset}`);
      return { created: false, error: error.message };
    }
  }

  async promptForBranchAction(status) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(`\n${colors.yellow}⚠️  Branch Protection Warning${colors.reset}\n`);
    
    status.warnings.forEach(warning => {
      console.log(`  ${colors.yellow}•${colors.reset} ${warning.message}`);
    });
    
    status.errors.forEach(error => {
      console.log(`  ${colors.red}•${colors.reset} ${error.message}`);
    });

    if (status.errors.length > 0) {
      console.log(`\n${colors.red}Cannot proceed due to errors above.${colors.reset}`);
      console.log('Suggestions:');
      console.log(`  1. Pull latest changes: ${colors.cyan}git pull${colors.reset}`);
      console.log(`  2. Use --force flag to override (not recommended)`);
      rl.close();
      return { action: 'abort' };
    }

    return new Promise((resolve) => {
      const options = [];
      options.push('1. Continue anyway');
      
      if (this.config.autoCreateReleaseBranch) {
        options.push('2. Create release branch');
      }
      
      options.push(`${options.length + 1}. Abort`);

      options.forEach(opt => console.log(`  ${opt}`));

      rl.question(`\nChoose option (1-${options.length}): `, (answer) => {
        rl.close();
        const choice = parseInt(answer);
        
        if (choice === 1) {
          resolve({ action: 'continue' });
        } else if (choice === 2 && this.config.autoCreateReleaseBranch) {
          resolve({ action: 'create-branch' });
        } else {
          resolve({ action: 'abort' });
        }
      });
    });
  }

  getRemoteBranches() {
    try {
      const branches = execSync('git branch -r', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .map(b => b.trim().replace('origin/', ''))
        .filter(b => !b.includes('HEAD'));
      return branches;
    } catch (error) {
      return [];
    }
  }

  suggestBranchName(versionType) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    
    const suggestions = {
      patch: `hotfix/${dateStr}`,
      minor: `feature/${dateStr}`,
      major: `release/${dateStr}`
    };
    
    return suggestions[versionType] || `release/${dateStr}`;
  }
}

module.exports = BranchProtection;