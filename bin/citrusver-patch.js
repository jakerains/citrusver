#!/usr/bin/env node

const CitrusVer = require('../lib/version-bump');

async function main() {
  try {
    const citrusver = new CitrusVer();
    await citrusver.bump('patch');
  } catch (error) {
    console.error('❌ CitrusVer patch failed:', error.message);
    process.exit(1);
  }
}

main();