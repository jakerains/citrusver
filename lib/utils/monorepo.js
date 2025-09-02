const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MonorepoManager {
  constructor(config = {}) {
    this.config = {
      packages: config.packages || 'packages/*',
      independent: config.independent || false,
      syncVersions: config.syncVersions || true,
      ...config
    };
  }

  async detectWorkspaces() {
    const rootPackageJson = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(rootPackageJson)) {
      return null;
    }
    
    const packageData = JSON.parse(fs.readFileSync(rootPackageJson, 'utf8'));
    
    // Check for npm/yarn workspaces
    if (packageData.workspaces) {
      return {
        type: 'npm-workspaces',
        patterns: Array.isArray(packageData.workspaces) 
          ? packageData.workspaces 
          : packageData.workspaces.packages
      };
    }
    
    // Check for lerna
    const lernaJson = path.join(process.cwd(), 'lerna.json');
    if (fs.existsSync(lernaJson)) {
      const lernaConfig = JSON.parse(fs.readFileSync(lernaJson, 'utf8'));
      return {
        type: 'lerna',
        patterns: lernaConfig.packages || ['packages/*']
      };
    }
    
    // Check for pnpm
    const pnpmWorkspace = path.join(process.cwd(), 'pnpm-workspace.yaml');
    if (fs.existsSync(pnpmWorkspace)) {
      // Simple parsing - in production would use a YAML parser
      const content = fs.readFileSync(pnpmWorkspace, 'utf8');
      const matches = content.match(/packages:\s*\n((?:\s+-\s+.+\n?)+)/);
      if (matches) {
        const patterns = matches[1]
          .split('\n')
          .map(line => line.replace(/^\s*-\s*/, '').trim())
          .filter(Boolean);
        return {
          type: 'pnpm-workspaces',
          patterns
        };
      }
    }
    
    return null;
  }

  async getPackages() {
    const workspace = await this.detectWorkspaces();
    if (!workspace) {
      return [];
    }
    
    const packages = [];
    const patterns = workspace.patterns || [this.config.packages];
    
    for (const pattern of patterns) {
      const dirs = this.expandPattern(pattern);
      
      for (const dir of dirs) {
        const packageJsonPath = path.join(dir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          packages.push({
            name: packageData.name,
            version: packageData.version,
            path: dir,
            packageJsonPath,
            private: packageData.private || false
          });
        }
      }
    }
    
    return packages;
  }

  expandPattern(pattern) {
    const dirs = [];
    const basePath = process.cwd();
    
    // Handle glob patterns
    if (pattern.includes('*')) {
      const parts = pattern.split('/');
      const globIndex = parts.findIndex(p => p.includes('*'));
      
      if (globIndex === -1) {
        dirs.push(path.join(basePath, pattern));
      } else {
        const baseDir = path.join(basePath, ...parts.slice(0, globIndex));
        
        if (fs.existsSync(baseDir) && fs.statSync(baseDir).isDirectory()) {
          const entries = fs.readdirSync(baseDir);
          
          for (const entry of entries) {
            const fullPath = path.join(baseDir, entry);
            if (fs.statSync(fullPath).isDirectory()) {
              // Check if this matches the pattern
              if (parts[globIndex] === '*' || this.matchesGlob(entry, parts[globIndex])) {
                dirs.push(fullPath);
              }
            }
          }
        }
      }
    } else {
      dirs.push(path.join(basePath, pattern));
    }
    
    return dirs;
  }

  matchesGlob(str, pattern) {
    // Simple glob matching - in production would use a proper glob library
    const regex = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${regex}$`).test(str);
  }

  async bumpPackageVersions(versionType, options = {}) {
    const packages = await this.getPackages();
    const results = [];
    
    if (this.config.independent) {
      // Independent versioning - each package can have its own version
      for (const pkg of packages) {
        if (!pkg.private || options.includePrivate) {
          const newVersion = await this.bumpPackageVersion(pkg, versionType, options);
          results.push({ ...pkg, newVersion });
        }
      }
    } else if (this.config.syncVersions) {
      // Synchronized versioning - all packages get the same version
      const rootPackageJson = path.join(process.cwd(), 'package.json');
      const rootData = JSON.parse(fs.readFileSync(rootPackageJson, 'utf8'));
      const newVersion = this.calculateNewVersion(rootData.version, versionType, options);
      
      // Update root
      rootData.version = newVersion;
      if (!options.dryRun) {
        fs.writeFileSync(rootPackageJson, JSON.stringify(rootData, null, 2) + '\n');
      }
      
      // Update all packages
      for (const pkg of packages) {
        if (!pkg.private || options.includePrivate) {
          const packageData = JSON.parse(fs.readFileSync(pkg.packageJsonPath, 'utf8'));
          packageData.version = newVersion;
          
          // Update internal dependencies
          this.updateInternalDependencies(packageData, packages, newVersion);
          
          if (!options.dryRun) {
            fs.writeFileSync(pkg.packageJsonPath, JSON.stringify(packageData, null, 2) + '\n');
          }
          
          results.push({ ...pkg, newVersion });
        }
      }
    }
    
    return results;
  }

  async bumpPackageVersion(pkg, versionType, options = {}) {
    const packageData = JSON.parse(fs.readFileSync(pkg.packageJsonPath, 'utf8'));
    const newVersion = this.calculateNewVersion(packageData.version, versionType, options);
    
    packageData.version = newVersion;
    
    if (!options.dryRun) {
      fs.writeFileSync(pkg.packageJsonPath, JSON.stringify(packageData, null, 2) + '\n');
    }
    
    return newVersion;
  }

  calculateNewVersion(currentVersion, versionType, options = {}) {
    const parts = currentVersion.split('.');
    const [major, minor, patch] = parts.map(p => parseInt(p) || 0);
    
    switch(versionType) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  updateInternalDependencies(packageData, allPackages, newVersion) {
    const packageNames = new Set(allPackages.map(p => p.name));
    
    ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
      if (packageData[depType]) {
        Object.keys(packageData[depType]).forEach(dep => {
          if (packageNames.has(dep)) {
            // Update to new version, preserving version range prefix
            const currentSpec = packageData[depType][dep];
            const prefix = currentSpec.match(/^[\^~]/) ? currentSpec[0] : '';
            packageData[depType][dep] = prefix + newVersion;
          }
        });
      }
    });
  }

  async getChangedPackages() {
    const packages = await this.getPackages();
    const changedPackages = [];
    
    for (const pkg of packages) {
      try {
        // Check if package has changes since last tag
        const lastTag = execSync(`git describe --tags --abbrev=0 2>/dev/null || echo ""`, {
          cwd: pkg.path,
          encoding: 'utf8'
        }).trim();
        
        if (lastTag) {
          const changes = execSync(`git diff ${lastTag}..HEAD --name-only -- ${pkg.path}`, {
            encoding: 'utf8'
          }).trim();
          
          if (changes) {
            changedPackages.push(pkg);
          }
        } else {
          // No tags, consider it changed
          changedPackages.push(pkg);
        }
      } catch (error) {
        // Error checking, consider it changed
        changedPackages.push(pkg);
      }
    }
    
    return changedPackages;
  }
}

module.exports = MonorepoManager;