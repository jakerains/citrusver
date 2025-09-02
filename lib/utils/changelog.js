const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ChangelogGenerator {
  constructor() {
    this.conventionalTypes = {
      feat: '✨ Features',
      fix: '🐛 Bug Fixes',
      docs: '📚 Documentation',
      style: '💅 Styling',
      refactor: '♻️ Code Refactoring',
      perf: '⚡ Performance',
      test: '🧪 Tests',
      build: '🔨 Build System',
      ci: '👷 CI/CD',
      chore: '🔧 Chores',
      revert: '⏪ Reverts'
    };
  }

  async generate(fromVersion, toVersion, options = {}) {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const commits = this.getCommitsSince(fromVersion);
    const groupedCommits = this.groupCommitsByType(commits);
    const changelogEntry = this.formatChangelogEntry(toVersion, groupedCommits, options);
    
    this.updateChangelogFile(changelogPath, changelogEntry);
    return changelogEntry;
  }

  getCommitsSince(version) {
    try {
      const tagName = version ? `v${version}` : '';
      const range = tagName ? `${tagName}..HEAD` : '';
      
      // Get commits with hash, subject, and body
      const format = '%H|%s|%b|%ae|%an|%ai';
      const cmd = range 
        ? `git log ${range} --format="${format}"`
        : `git log --format="${format}"`;
      
      const output = execSync(cmd, { encoding: 'utf8' });
      
      return output.trim().split('\n').filter(Boolean).map(line => {
        const [hash, subject, body, email, author, date] = line.split('|');
        return { hash, subject, body, email, author, date };
      });
    } catch (error) {
      return [];
    }
  }

  groupCommitsByType(commits) {
    const grouped = {
      breaking: [],
      feat: [],
      fix: [],
      docs: [],
      style: [],
      refactor: [],
      perf: [],
      test: [],
      build: [],
      ci: [],
      chore: [],
      revert: [],
      other: []
    };

    commits.forEach(commit => {
      const { subject, body } = commit;
      
      // Check for breaking changes
      if (body && body.includes('BREAKING CHANGE')) {
        grouped.breaking.push(commit);
        return;
      }

      // Parse conventional commit format
      const match = subject.match(/^(\w+)(?:\(([^)]+)\))?!?:\s*(.+)/);
      if (match) {
        const [, type, scope, message] = match;
        commit.type = type;
        commit.scope = scope;
        commit.message = message;
        
        if (grouped[type]) {
          grouped[type].push(commit);
        } else {
          grouped.other.push(commit);
        }
      } else {
        grouped.other.push(commit);
      }
    });

    return grouped;
  }

  formatChangelogEntry(version, groupedCommits, options = {}) {
    const date = new Date().toISOString().split('T')[0];
    let entry = `## [${version}] - ${date}\n\n`;

    // Add breaking changes first
    if (groupedCommits.breaking.length > 0) {
      entry += `### ⚠️ BREAKING CHANGES\n\n`;
      groupedCommits.breaking.forEach(commit => {
        entry += `- ${this.formatCommit(commit)}\n`;
      });
      entry += '\n';
    }

    // Add other commit types
    Object.entries(this.conventionalTypes).forEach(([type, title]) => {
      if (groupedCommits[type] && groupedCommits[type].length > 0) {
        entry += `### ${title}\n\n`;
        groupedCommits[type].forEach(commit => {
          entry += `- ${this.formatCommit(commit)}\n`;
        });
        entry += '\n';
      }
    });

    // Add uncategorized commits if any
    if (groupedCommits.other.length > 0 && !options.conventionalOnly) {
      entry += `### Other Changes\n\n`;
      groupedCommits.other.forEach(commit => {
        entry += `- ${commit.subject} (${commit.hash.substring(0, 7)})\n`;
      });
      entry += '\n';
    }

    return entry;
  }

  formatCommit(commit) {
    const shortHash = commit.hash.substring(0, 7);
    const message = commit.message || commit.subject;
    const scope = commit.scope ? `**${commit.scope}:** ` : '';
    return `${scope}${message} ([${shortHash}])`;
  }

  updateChangelogFile(changelogPath, newEntry) {
    let existingContent = '';
    
    if (fs.existsSync(changelogPath)) {
      existingContent = fs.readFileSync(changelogPath, 'utf8');
    } else {
      existingContent = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
    }

    // Insert new entry after the header
    const lines = existingContent.split('\n');
    let insertIndex = 0;
    
    // Find where to insert (after header and any blank lines)
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('# ')) {
        insertIndex = i + 1;
        // Skip blank lines after header
        while (insertIndex < lines.length && lines[insertIndex].trim() === '') {
          insertIndex++;
        }
        break;
      }
    }

    lines.splice(insertIndex, 0, newEntry);
    fs.writeFileSync(changelogPath, lines.join('\n'));
  }
}

module.exports = ChangelogGenerator;