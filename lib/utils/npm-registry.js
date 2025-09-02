const { execSync } = require('child_process');
const https = require('https');

class NPMRegistry {
  constructor() {
    this.registryUrl = 'https://registry.npmjs.org';
  }

  async checkVersion(packageName, version) {
    return new Promise((resolve, reject) => {
      const url = `${this.registryUrl}/${packageName}`;
      
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const packageData = JSON.parse(data);
            const versions = Object.keys(packageData.versions || {});
            
            resolve({
              exists: versions.includes(version),
              latest: packageData['dist-tags']?.latest,
              versions: versions
            });
          } catch (error) {
            resolve({ exists: false, latest: null, versions: [] });
          }
        });
      }).on('error', (err) => {
        resolve({ exists: false, latest: null, versions: [] });
      });
    });
  }

  async getLatestVersion(packageName) {
    try {
      const output = execSync(`npm view ${packageName} version`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return output.trim();
    } catch (error) {
      return null;
    }
  }

  async publish(options = {}) {
    const { dryRun, tag = 'latest', access = 'public' } = options;
    
    try {
      let cmd = 'npm publish';
      
      if (dryRun) {
        cmd += ' --dry-run';
      }
      
      if (tag && tag !== 'latest') {
        cmd += ` --tag ${tag}`;
      }
      
      if (access) {
        cmd += ` --access ${access}`;
      }
      
      const output = execSync(cmd, { 
        encoding: 'utf8',
        stdio: dryRun ? 'pipe' : 'inherit'
      });
      
      return { success: true, output };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async checkUnpublishedDeps() {
    try {
      const packageJson = require(process.cwd() + '/package.json');
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
        ...packageJson.peerDependencies
      };
      
      const unpublished = [];
      
      for (const [name, version] of Object.entries(allDeps)) {
        // Skip local file dependencies
        if (version.startsWith('file:') || version.startsWith('link:')) {
          continue;
        }
        
        // Check if package exists on npm
        const registryInfo = await this.checkVersion(name, version);
        if (!registryInfo.latest) {
          unpublished.push({ name, version, reason: 'not found on npm' });
        }
      }
      
      return unpublished;
    } catch (error) {
      return [];
    }
  }

  compareVersions(local, remote) {
    if (!local || !remote) return 'unknown';
    
    const localParts = local.split('.').map(Number);
    const remoteParts = remote.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (localParts[i] > remoteParts[i]) return 'ahead';
      if (localParts[i] < remoteParts[i]) return 'behind';
    }
    
    return 'same';
  }
}

module.exports = NPMRegistry;