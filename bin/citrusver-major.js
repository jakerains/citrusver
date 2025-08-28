#!/usr/bin/env node

const CitrusVer = require('../lib/version-bump');

async function main() {
  try {
    const citrusver = new CitrusVer();
    await citrusver.bump('major');
  } catch (error) {
    console.error('❌ CitrusVer major failed:', error.message);
    process.exit(1);
  }
}

main();