'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Copy, Github } from 'lucide-react'

export default function Hero() {
  const [copied, setCopied] = useState(false)
  const [currentDomain, setCurrentDomain] = useState('citrusver.jakerains.com')
  const npmCommand = 'npx citrusver patch'

  useEffect(() => {
    // Dynamically detect the current domain
    if (typeof window !== 'undefined') {
      setCurrentDomain(window.location.host)
    }
  }, [])

  const installCommand = `curl -fsSL https://${currentDomain}/install.sh | bash`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl" aria-hidden="true">
          <div
            className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-yellow-200 to-green-200 opacity-20"
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2">
          <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium bg-yellow-100 text-yellow-900 border-yellow-200">
            v3.0 - Now with zero dependencies
          </Badge>
        </div>

        {/* Lemon Logo and Title */}
        <div className="mb-6">
          <div className="text-7xl mb-4 animate-bounce">🍋</div>
          <h1 className="text-6xl font-bold tracking-tight text-gray-900 sm:text-7xl">
            CITRUSVER
            <span className="ml-4 text-7xl">🍋</span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="mt-6 text-xl leading-8 text-gray-600 font-medium">
          Fresh squeezed version management
        </p>
        <p className="mt-2 text-lg leading-8 text-gray-500">
          Beautiful, interactive version bumping for Node.js projects with optional git workflows
        </p>

        {/* Install Command */}
        <div className="mt-12 space-y-4">
          <div className="mx-auto max-w-2xl">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Quick Install (macOS/Linux)
            </label>
            <div className="flex items-center gap-2 rounded-lg bg-gray-900 p-4 font-mono text-sm">
              <span className="flex-1 text-left text-green-400">
                $ {installCommand}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => copyToClipboard(installCommand)}
                className="shrink-0 bg-gray-700 hover:bg-gray-600"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mx-auto max-w-2xl">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Or use NPM (no installation needed)
            </label>
            <div className="flex items-center gap-2 rounded-lg bg-gray-900 p-4 font-mono text-sm">
              <span className="flex-1 text-left text-green-400">
                $ {npmCommand}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => copyToClipboard(npmCommand)}
                className="shrink-0 bg-gray-700 hover:bg-gray-600"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button
            size="lg"
            asChild
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            <a href="#features">View Features</a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
          >
            <a href="https://github.com/jakerains/citrusver" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              View on GitHub
            </a>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="mt-1 text-sm text-gray-600">Dependencies</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">5</div>
            <div className="mt-1 text-sm text-gray-600">Version Types</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">100%</div>
            <div className="mt-1 text-sm text-gray-600">Pure Node.js</div>
          </div>
        </div>
      </div>
    </section>
  )
}
