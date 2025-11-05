import { NextResponse } from 'next/server'

export async function GET() {
  const installScript = `#!/bin/bash
# CitrusVer Installation Script
# Fresh squeezed version management for Node.js

set -e

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color
BOLD='\\033[1m'

# Lemon emoji
LEMON="🍋"

echo ""
echo -e "\${YELLOW}\${BOLD}    \${LEMON} CITRUSVER INSTALLER \${LEMON}\${NC}"
echo -e "\${YELLOW}Fresh squeezed version management\${NC}"
echo ""

# Detect OS
OS=\$(uname -s | tr '[:upper:]' '[:lower:]')
case "\${OS}" in
  linux*)   OS='linux';;
  darwin*)  OS='macos';;
  *)
    echo -e "\${RED}Error: Unsupported operating system \${OS}\${NC}"
    echo "CitrusVer supports macOS and Linux"
    exit 1
    ;;
esac

# Detect Architecture
ARCH=\$(uname -m)
case "\${ARCH}" in
  x86_64)   ARCH='x64';;
  aarch64)  ARCH='arm64';;
  arm64)    ARCH='arm64';;
  *)
    echo -e "\${RED}Error: Unsupported architecture \${ARCH}\${NC}"
    echo "CitrusVer supports x64 and arm64"
    exit 1
    ;;
esac

echo -e "Detected: \${GREEN}\${OS}-\${ARCH}\${NC}"
echo ""

# GitHub release information
GITHUB_REPO="jakerains/citrusver"
BINARY_NAME="citrusver"

# Get latest release version
echo "Fetching latest release..."
LATEST_VERSION=\$(curl -s "https://api.github.com/repos/\${GITHUB_REPO}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"v?([^"]+)".*/\\1/')

if [ -z "\${LATEST_VERSION}" ]; then
  echo -e "\${RED}Error: Could not fetch latest version\${NC}"
  echo "Falling back to NPM installation..."
  echo ""
  echo "Run: npm install -g citrusver"
  exit 1
fi

echo -e "Latest version: \${GREEN}v\${LATEST_VERSION}\${NC}"

# Construct download URL
DOWNLOAD_URL="https://github.com/\${GITHUB_REPO}/releases/download/v\${LATEST_VERSION}/citrusver-\${OS}-\${ARCH}"

echo "Downloading CitrusVer..."
echo "URL: \${DOWNLOAD_URL}"

# Create temporary directory
TMP_DIR=\$(mktemp -d)
TMP_FILE="\${TMP_DIR}/\${BINARY_NAME}"

# Download binary
if command -v curl &> /dev/null; then
  curl -fsSL "\${DOWNLOAD_URL}" -o "\${TMP_FILE}"
elif command -v wget &> /dev/null; then
  wget -q "\${DOWNLOAD_URL}" -O "\${TMP_FILE}"
else
  echo -e "\${RED}Error: Neither curl nor wget is available\${NC}"
  echo "Please install curl or wget and try again"
  exit 1
fi

# Check if download was successful
if [ ! -f "\${TMP_FILE}" ] || [ ! -s "\${TMP_FILE}" ]; then
  echo -e "\${RED}Error: Download failed or file is empty\${NC}"
  echo ""
  echo "Binary not yet available for this platform."
  echo "Please install via NPM instead:"
  echo -e "\${YELLOW}npm install -g citrusver\${NC}"
  exit 1
fi

# Make binary executable
chmod +x "\${TMP_FILE}"

# Determine installation directory
INSTALL_DIR="/usr/local/bin"

# Check if we have write permission
if [ -w "\${INSTALL_DIR}" ]; then
  # We have permission, install directly
  mv "\${TMP_FILE}" "\${INSTALL_DIR}/\${BINARY_NAME}"
  echo -e "\${GREEN}✓ Installed to \${INSTALL_DIR}/\${BINARY_NAME}\${NC}"
else
  # Need sudo
  echo "Installing to \${INSTALL_DIR} (requires sudo)..."
  sudo mv "\${TMP_FILE}" "\${INSTALL_DIR}/\${BINARY_NAME}"
  echo -e "\${GREEN}✓ Installed to \${INSTALL_DIR}/\${BINARY_NAME}\${NC}"
fi

# Clean up
rm -rf "\${TMP_DIR}"

# Verify installation
if command -v citrusver &> /dev/null; then
  INSTALLED_VERSION=\$(citrusver --version 2>/dev/null || echo "unknown")
  echo ""
  echo -e "\${GREEN}\${BOLD}========================================\${NC}"
  echo -e "\${GREEN}\${BOLD}     ✓ INSTALLATION SUCCESSFUL!\${NC}"
  echo -e "\${GREEN}\${BOLD}========================================\${NC}"
  echo ""
  echo -e "CitrusVer \${YELLOW}v\${LATEST_VERSION}\${NC} has been installed!"
  echo ""
  echo "Get started with:"
  echo -e "\${YELLOW}  citrusver patch\${NC}        # Simple version bump"
  echo -e "\${YELLOW}  citrusver --help\${NC}       # View all commands"
  echo ""
  echo -e "\${LEMON} Fresh release squeezed! \${LEMON}"
  echo ""
else
  echo -e "\${YELLOW}Installation completed, but 'citrusver' command not found in PATH\${NC}"
  echo "You may need to restart your terminal or add \${INSTALL_DIR} to your PATH"
fi
`

  return new NextResponse(installScript, {
    headers: {
      'Content-Type': 'text/x-shellscript; charset=utf-8',
      'Content-Disposition': 'inline; filename="install.sh"',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  })
}

export const dynamic = 'force-static'
