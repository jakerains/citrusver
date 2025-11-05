# CitrusVer Website

This is the official landing page for CitrusVer, built with Next.js 15.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

This site is designed to be deployed on Vercel at `citrusver.jakerains.com`.

### Vercel Deployment Steps

1. Push this code to GitHub
2. Import the project to Vercel
3. Set the **Root Directory** to `website`
4. Configure custom domain:
   - Go to Project Settings → Domains
   - Add `citrusver.jakerains.com`
   - Update DNS records as instructed by Vercel
5. Deploy!

### Environment Variables

No environment variables are required for this project.

## Features

- **Hero Section**: Install command with copy button
- **Features**: Showcase of CitrusVer capabilities
- **Terminal Demo**: Animated terminal showing CitrusVer in action
- **Documentation**: Complete usage guide with tabs
- **Install Script**: Hosted at `/install.sh` for curl installation

## Install Script

The install script is served via Next.js API route at `/install.sh`. It:
- Detects OS (macOS/Linux) and architecture (x64/arm64)
- Downloads the appropriate binary from GitHub releases
- Installs to `/usr/local/bin`
- Verifies installation

Users can install with:
```bash
curl -fsSL https://citrusver.jakerains.com/install.sh | bash
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Deployment**: Vercel
- **Language**: TypeScript
