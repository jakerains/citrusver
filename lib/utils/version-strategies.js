const { execSync } = require('child_process');

class VersionStrategies {
  constructor() {
    this.strategies = {
      semver: this.semverStrategy.bind(this),
      date: this.dateStrategy.bind(this),
      prerelease: this.prereleaseStrategy.bind(this),
      custom: this.customStrategy.bind(this)
    };
  }

  getStrategy(type) {
    return this.strategies[type] || this.strategies.semver;
  }

  semverStrategy(currentVersion, versionType) {
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

  dateStrategy(currentVersion, versionType) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Format: YYYY.MM.DD or YYYY.MM.DD.patch
    const baseVersion = `${year}.${month}.${day}`;
    
    // Check if we already have a version for today
    if (currentVersion && currentVersion.startsWith(baseVersion)) {
      const parts = currentVersion.split('.');
      if (parts.length === 4) {
        const patch = parseInt(parts[3]) + 1;
        return `${baseVersion}.${patch}`;
      }
      return `${baseVersion}.1`;
    }
    
    return baseVersion;
  }

  prereleaseStrategy(currentVersion, versionType, preid = 'alpha') {
    // Remove existing prerelease tag if any
    const baseVersion = currentVersion.split('-')[0];
    const versionParts = baseVersion.split('.');
    
    // Check if current version already has a prerelease
    if (currentVersion.includes('-')) {
      const [, prereleaseTag] = currentVersion.split('-');
      const [currentPreid, currentPrenum] = prereleaseTag.split('.');
      
      if (currentPreid === preid) {
        // Increment prerelease number
        const prenum = parseInt(currentPrenum) + 1;
        return `${baseVersion}-${preid}.${prenum}`;
      }
    }
    
    // Create new prerelease
    let newBaseVersion;
    switch(versionType) {
      case 'major':
        newBaseVersion = `${parseInt(versionParts[0]) + 1}.0.0`;
        break;
      case 'minor':
        newBaseVersion = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}.0`;
        break;
      case 'patch':
      case 'prerelease':
      default:
        newBaseVersion = `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2]) + 1}`;
        break;
    }
    
    return `${newBaseVersion}-${preid}.0`;
  }

  customStrategy(currentVersion, versionType, pattern) {
    if (!pattern) {
      return this.semverStrategy(currentVersion, versionType);
    }
    
    // Support custom patterns with placeholders
    const now = new Date();
    const replacements = {
      '{{year}}': now.getFullYear(),
      '{{month}}': String(now.getMonth() + 1).padStart(2, '0'),
      '{{day}}': String(now.getDate()).padStart(2, '0'),
      '{{timestamp}}': Date.now(),
      '{{current}}': currentVersion
    };
    
    let result = pattern;
    Object.entries(replacements).forEach(([key, value]) => {
      result = result.replace(new RegExp(key, 'g'), value);
    });
    
    return result;
  }

  validateVersion(version) {
    // Basic validation - can be extended
    if (!version || typeof version !== 'string') {
      return false;
    }

    // Allow semver, date-based, and prerelease versions
    const semverPattern = /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/;
    const datePattern = /^\d{4}\.\d{2}\.\d{2}(\.\d+)?$/;

    return semverPattern.test(version) || datePattern.test(version);
  }

  applyLabel(version, label) {
    if (!label) return version;

    // Get base version without any existing prerelease tag
    const baseVersion = version.split('-')[0];

    // Validate label (alphanumeric, hyphens, dots allowed)
    if (!/^[\w.-]+$/.test(label)) {
      throw new Error(`Invalid label format: ${label}. Use alphanumeric characters, hyphens, or dots.`);
    }

    return `${baseVersion}-${label}`;
  }
}

module.exports = VersionStrategies;