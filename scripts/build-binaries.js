#!/usr/bin/env bun
/**
 * CitrusVer Binary Build Script
 *
 * Compiles CitrusVer into standalone executables for multiple platforms
 * using Bun's build --compile feature.
 *
 * Platforms:
 * - macOS arm64 (Apple Silicon)
 * - macOS x64 (Intel)
 * - Linux x64
 * - Linux arm64
 */

import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const platforms = [
  { target: "bun-darwin-arm64", outfile: "citrusver-macos-arm64", platform: "macOS (Apple Silicon)" },
  { target: "bun-darwin-x64", outfile: "citrusver-macos-x64", platform: "macOS (Intel)" },
  { target: "bun-linux-x64", outfile: "citrusver-linux-x64", platform: "Linux (x86_64)" },
  { target: "bun-linux-arm64", outfile: "citrusver-linux-arm64", platform: "Linux (ARM64)" }
];

const DIST_DIR = './dist';
const ENTRY_POINT = './bin/citrusver.js';

async function buildBinaries() {
  console.log('\n🍋 CitrusVer Binary Builder\n');
  console.log('Building standalone executables for all platforms...\n');

  // Create dist directory if it doesn't exist
  if (!existsSync(DIST_DIR)) {
    await mkdir(DIST_DIR, { recursive: true });
    console.log(`✓ Created ${DIST_DIR} directory\n`);
  }

  // Verify entry point exists
  if (!existsSync(ENTRY_POINT)) {
    console.error(`❌ Entry point not found: ${ENTRY_POINT}`);
    process.exit(1);
  }

  let successCount = 0;
  let failureCount = 0;

  // Build for each platform
  for (const { target, outfile, platform } of platforms) {
    const outputPath = join(DIST_DIR, outfile);

    try {
      console.log(`\n📦 Building for ${platform}...`);
      console.log(`   Target: ${target}`);
      console.log(`   Output: ${outputPath}`);

      const result = await Bun.build({
        entrypoints: [ENTRY_POINT],
        outdir: DIST_DIR,
        compile: {
          target,
          outfile
        },
        minify: false, // Keep readable for debugging
        sourcemap: 'none'
      });

      if (result.success) {
        // Get file size
        const stats = await Bun.file(outputPath).size;
        const sizeMB = (stats / 1024 / 1024).toFixed(2);

        console.log(`   ✅ Success! (${sizeMB} MB)`);
        successCount++;
      } else {
        console.error(`   ❌ Build failed`);
        if (result.logs && result.logs.length > 0) {
          result.logs.forEach(log => console.error(`      ${log}`));
        }
        failureCount++;
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      failureCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Build Summary:');
  console.log(`  ✅ Successful: ${successCount}/${platforms.length}`);
  console.log(`  ❌ Failed: ${failureCount}/${platforms.length}`);
  console.log('='.repeat(50));

  if (failureCount === 0) {
    console.log('\n🎉 All binaries built successfully!');
    console.log(`\nBinaries available in: ${DIST_DIR}/`);
    console.log('\nNext steps:');
    console.log('  1. Test the binaries locally');
    console.log('  2. Create a GitHub release');
    console.log('  3. Upload binaries to the release');
    console.log('\n🍋 Fresh release squeezed!\n');
  } else {
    console.error('\n❌ Some builds failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run the build
buildBinaries().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
