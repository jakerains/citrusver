const fs = require('fs');
const path = require('path');

class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = {
      'pre-version': [],
      'post-version': [],
      'pre-commit': [],
      'post-commit': [],
      'pre-tag': [],
      'post-tag': [],
      'pre-push': [],
      'post-push': [],
      'changelog-generate': [],
      'version-calculate': []
    };
  }

  async loadPlugins(config) {
    const pluginList = config.plugins || [];
    
    for (const pluginName of pluginList) {
      await this.loadPlugin(pluginName);
    }
  }

  async loadPlugin(pluginName) {
    try {
      let plugin;
      
      // Try to load from node_modules first
      try {
        plugin = require(pluginName);
      } catch (e) {
        // Try local plugin directory
        const localPath = path.join(process.cwd(), '.citrusver', 'plugins', pluginName);
        if (fs.existsSync(localPath + '.js')) {
          plugin = require(localPath);
        } else {
          console.warn(`⚠️  Plugin not found: ${pluginName}`);
          return;
        }
      }
      
      // Initialize plugin
      if (typeof plugin === 'function') {
        plugin = new plugin();
      }
      
      // Validate plugin
      if (!plugin.name || !plugin.version) {
        console.warn(`⚠️  Invalid plugin: ${pluginName}`);
        return;
      }
      
      // Register plugin
      this.plugins.set(plugin.name, plugin);
      
      // Register hooks
      if (plugin.hooks) {
        Object.entries(plugin.hooks).forEach(([hookName, handler]) => {
          if (this.hooks[hookName]) {
            this.hooks[hookName].push({
              plugin: plugin.name,
              handler
            });
          }
        });
      }
      
      console.log(`✅ Loaded plugin: ${plugin.name} v${plugin.version}`);
    } catch (error) {
      console.error(`❌ Failed to load plugin ${pluginName}:`, error.message);
    }
  }

  async executeHook(hookName, context) {
    const hookHandlers = this.hooks[hookName] || [];
    const results = [];
    
    for (const { plugin, handler } of hookHandlers) {
      try {
        const result = await handler(context);
        results.push({ plugin, result });
      } catch (error) {
        console.error(`❌ Plugin ${plugin} hook ${hookName} failed:`, error.message);
        if (context.failOnError) {
          throw error;
        }
      }
    }
    
    return results;
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  listPlugins() {
    return Array.from(this.plugins.values()).map(p => ({
      name: p.name,
      version: p.version,
      description: p.description
    }));
  }
}

// Example plugin base class
class CitrusVerPlugin {
  constructor() {
    this.name = 'unnamed-plugin';
    this.version = '1.0.0';
    this.description = 'A CitrusVer plugin';
    this.hooks = {};
  }

  // Override in subclasses
  async init(config) {
    // Plugin initialization
  }
}

module.exports = { PluginManager, CitrusVerPlugin };