const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class RollbackManager {
  constructor() {
    this.stateDir = path.join(process.cwd(), '.citrusver');
    this.stateFile = path.join(this.stateDir, 'last-state.json');
    this.backupDir = path.join(this.stateDir, 'backups');
  }

  async saveState(state) {
    // Ensure directories exist
    if (!fs.existsSync(this.stateDir)) {
      fs.mkdirSync(this.stateDir, { recursive: true });
    }
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Save current git state
    const gitState = {
      branch: this.getCurrentBranch(),
      commit: this.getCurrentCommit(),
      uncommittedChanges: this.getUncommittedChanges(),
      tags: this.getRecentTags()
    };

    // Backup package.json files
    const backups = await this.backupPackageFiles();

    const fullState = {
      ...state,
      timestamp: new Date().toISOString(),
      git: gitState,
      backups
    };

    fs.writeFileSync(this.stateFile, JSON.stringify(fullState, null, 2));
    return fullState;
  }

  async rollback() {
    if (!fs.existsSync(this.stateFile)) {
      throw new Error('No rollback state found');
    }

    const state = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
    console.log('🔄 Rolling back to previous state...');

    try {
      // Restore package.json files
      if (state.backups) {
        for (const backup of state.backups) {
          if (fs.existsSync(backup.backupPath)) {
            const content = fs.readFileSync(backup.backupPath, 'utf8');
            fs.writeFileSync(backup.originalPath, content);
            console.log(`  ✓ Restored ${backup.originalPath}`);
          }
        }
      }

      // Reset git if needed
      if (state.git && state.operation !== 'dry-run') {
        // Check if we created a commit
        const currentCommit = this.getCurrentCommit();
        if (currentCommit !== state.git.commit) {
          console.log('  ✓ Resetting git commit...');
          execSync(`git reset --mixed ${state.git.commit}`, { stdio: 'pipe' });
        }

        // Remove any tags we created
        if (state.createdTag) {
          try {
            execSync(`git tag -d ${state.createdTag}`, { stdio: 'pipe' });
            console.log(`  ✓ Removed tag ${state.createdTag}`);
          } catch (e) {
            // Tag might not exist
          }
        }
      }

      // Clean up state file
      fs.unlinkSync(this.stateFile);
      console.log('✅ Rollback completed successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  }

  async backupPackageFiles() {
    const backups = [];
    const timestamp = Date.now();

    // Backup root package.json
    const rootPackage = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(rootPackage)) {
      const backupPath = path.join(this.backupDir, `package-root-${timestamp}.json`);
      fs.copyFileSync(rootPackage, backupPath);
      backups.push({
        originalPath: rootPackage,
        backupPath,
        type: 'root'
      });
    }

    // Backup workspace package.json files if monorepo
    const workspacePatterns = this.getWorkspacePatterns();
    if (workspacePatterns) {
      for (const pattern of workspacePatterns) {
        const packages = this.findPackageJsonFiles(pattern);
        for (const pkgPath of packages) {
          const backupPath = path.join(
            this.backupDir, 
            `package-${path.basename(path.dirname(pkgPath))}-${timestamp}.json`
          );
          fs.copyFileSync(pkgPath, backupPath);
          backups.push({
            originalPath: pkgPath,
            backupPath,
            type: 'workspace'
          });
        }
      }
    }

    return backups;
  }

  getCurrentBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  getCurrentCommit() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      return null;
    }
  }

  getUncommittedChanges() {
    try {
      return execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    } catch (error) {
      return '';
    }
  }

  getRecentTags() {
    try {
      return execSync('git tag -l --sort=-version:refname | head -5', { 
        encoding: 'utf8' 
      }).trim().split('\n').filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  getWorkspacePatterns() {
    const packageJson = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJson)) {
      return null;
    }

    const data = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    if (data.workspaces) {
      return Array.isArray(data.workspaces) 
        ? data.workspaces 
        : data.workspaces.packages;
    }

    return null;
  }

  findPackageJsonFiles(pattern) {
    const files = [];
    const basePath = process.cwd();
    
    // Simple glob implementation
    if (pattern.includes('*')) {
      const parts = pattern.split('/');
      const dirs = this.expandGlob(basePath, parts);
      
      for (const dir of dirs) {
        const pkgPath = path.join(dir, 'package.json');
        if (fs.existsSync(pkgPath)) {
          files.push(pkgPath);
        }
      }
    } else {
      const pkgPath = path.join(basePath, pattern, 'package.json');
      if (fs.existsSync(pkgPath)) {
        files.push(pkgPath);
      }
    }

    return files;
  }

  expandGlob(basePath, parts) {
    const dirs = [];
    
    if (parts.length === 0) {
      return [basePath];
    }

    const [current, ...rest] = parts;
    
    if (current === '*' || current === '**') {
      const entries = fs.readdirSync(basePath);
      for (const entry of entries) {
        const fullPath = path.join(basePath, entry);
        if (fs.statSync(fullPath).isDirectory()) {
          if (rest.length > 0) {
            dirs.push(...this.expandGlob(fullPath, rest));
          } else {
            dirs.push(fullPath);
          }
        }
      }
    } else {
      const fullPath = path.join(basePath, current);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        if (rest.length > 0) {
          dirs.push(...this.expandGlob(fullPath, rest));
        } else {
          dirs.push(fullPath);
        }
      }
    }

    return dirs;
  }

  cleanup() {
    // Clean up old backups (keep last 10)
    if (!fs.existsSync(this.backupDir)) {
      return;
    }

    const files = fs.readdirSync(this.backupDir);
    const backupFiles = files
      .filter(f => f.startsWith('package-') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(this.backupDir, f),
        time: fs.statSync(path.join(this.backupDir, f)).mtime
      }))
      .sort((a, b) => b.time - a.time);

    // Keep only the 10 most recent backups
    if (backupFiles.length > 10) {
      for (let i = 10; i < backupFiles.length; i++) {
        fs.unlinkSync(backupFiles[i].path);
      }
    }
  }
}

module.exports = RollbackManager;