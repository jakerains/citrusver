#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

class UpdateChecker {
  constructor(packageName, currentVersion) {
    this.packageName = packageName;
    this.currentVersion = currentVersion;
    this.cacheDir = path.join(os.homedir(), '.citrusver');
    this.cacheFile = path.join(this.cacheDir, 'update-check.json');
    this.checkInterval = 24 * 60 * 60 * 1000; // 24 hours
  }

  async check() {
    try {
      // Check if we should skip based on environment
      if (process.env.NO_UPDATE_CHECK || process.env.CI) {
        return null;
      }

      // Check cache first
      const cachedData = this.getCachedData();
      if (cachedData && !this.shouldCheckAgain(cachedData.lastCheck)) {
        return cachedData.updateAvailable ? cachedData : null;
      }

      // Fetch latest version from npm registry
      const latestVersion = await this.fetchLatestVersion();
      
      if (!latestVersion) {
        return null;
      }

      const updateAvailable = this.compareVersions(latestVersion, this.currentVersion) > 0;
      
      // Cache the result
      const cacheData = {
        lastCheck: Date.now(),
        latestVersion,
        updateAvailable
      };
      
      this.saveCacheData(cacheData);
      
      return updateAvailable ? cacheData : null;
    } catch (error) {
      // Silently fail - don't interrupt the user's workflow
      return null;
    }
  }

  fetchLatestVersion() {
    return new Promise((resolve) => {
      const options = {
        hostname: 'registry.npmjs.org',
        path: `/${this.packageName}/latest`,
        method: 'GET',
        timeout: 3000, // 3 second timeout
        headers: {
          'Accept': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.version);
          } catch {
            resolve(null);
          }
        });
      });

      req.on('error', () => {
        resolve(null);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });

      req.end();
    });
  }

  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }
    
    return 0;
  }

  getCachedData() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf8');
        return JSON.parse(data);
      }
    } catch {
      // Ignore cache read errors
    }
    return null;
  }

  saveCacheData(data) {
    try {
      // Create cache directory if it doesn't exist
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }
      
      fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
    } catch {
      // Ignore cache write errors
    }
  }

  shouldCheckAgain(lastCheck) {
    return Date.now() - lastCheck > this.checkInterval;
  }

  formatUpdateMessage(latestVersion) {
    const yellow = '\x1b[93m';
    const cyan = '\x1b[36m';
    const green = '\x1b[32m';
    const gray = '\x1b[90m';
    const reset = '\x1b[0m';
    const bright = '\x1b[1m';
    
    let output = '\n';
    output += `${yellow}╭──────────────────────────────────────────────╮${reset}\n`;
    output += `${yellow}│${reset}  🍋 ${bright}CitrusVer Update Available!${reset}              ${yellow}│${reset}\n`;
    output += `${yellow}├──────────────────────────────────────────────┤${reset}\n`;
    output += `${yellow}│${reset}  Current   ${gray}${this.currentVersion.padEnd(34)}${reset}${yellow}│${reset}\n`;
    output += `${yellow}│${reset}  Latest    ${green}${latestVersion}${reset}${' '.repeat(34 - latestVersion.length)}${yellow}│${reset}\n`;
    output += `${yellow}│${reset}                                              ${yellow}│${reset}\n`;
    output += `${yellow}│${reset}  Update with:                                ${yellow}│${reset}\n`;
    output += `${yellow}│${reset}  ${cyan}npm install -g ${this.packageName}${reset}${' '.repeat(47 - 16 - this.packageName.length)}${yellow}│${reset}\n`;
    output += `${yellow}╰──────────────────────────────────────────────╯${reset}\n`;
    
    return output;
  }
}

module.exports = UpdateChecker;