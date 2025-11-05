'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'

type TerminalStep = {
  command?: string
  output?: string
  color?: string
  delay: number
}

const terminalSteps: TerminalStep[] = [
  {
    command: '$ citrusver patch --commit',
    delay: 500,
  },
  {
    output: '\n                    🍋 CITRUSVER 🍋\n              Interactive Version Management\n',
    color: 'text-yellow-400',
    delay: 1000,
  },
  {
    output: '╭──────────────────────────────────────────────╮\n│  🍋 CitrusVer · PATCH RELEASE                │\n├──────────────────────────────────────────────┤\n│  Current   1.0.0                             │\n│  Next      1.0.1                             │\n│                                              │\n│  Fresh-squeezed semver for your repo        │\n╰──────────────────────────────────────────────╯',
    color: 'text-gray-300',
    delay: 1500,
  },
  {
    output: '\n💬 Enter commit message: ',
    color: 'text-cyan-400',
    delay: 800,
  },
  {
    output: 'fix: update package dependencies',
    color: 'text-white',
    delay: 1200,
  },
  {
    output: '\n\n            ========================================\n                  ✅ VERSION BUMPED! ✅\n            ========================================\n\n                 New Version: v1.0.1\n\n            Changes have been committed\n\n            ----------------------------------------\n\n            🍋 Fresh release squeezed! 🍋',
    color: 'text-green-400',
    delay: 1500,
  },
]

export default function TerminalDemo() {
  const [displayedText, setDisplayedText] = useState<Array<{ text: string; color: string }>>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (currentStep >= terminalSteps.length) {
      // Reset animation after completion
      const resetTimeout = setTimeout(() => {
        setDisplayedText([])
        setCurrentStep(0)
        setIsAnimating(false)
      }, 3000)
      return () => clearTimeout(resetTimeout)
    }

    const step = terminalSteps[currentStep]
    const timeout = setTimeout(() => {
      const text = (step.command || step.output || '')
      setDisplayedText((prev) => [
        ...prev,
        {
          text,
          color: step.color || 'text-green-400',
        },
      ])
      setCurrentStep((prev) => prev + 1)
    }, step.delay)

    return () => clearTimeout(timeout)
  }, [currentStep])

  return (
    <section className="py-24 sm:py-32 px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            See it in action
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Beautiful, interactive version bumping with colorful terminal output
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <Card className="bg-gray-900 border-gray-700 overflow-hidden">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 text-center text-sm text-gray-400 font-mono">
                terminal
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6 font-mono text-sm min-h-[500px]">
              {displayedText.map((line, index) => (
                <div key={index} className={`${line.color} whitespace-pre-wrap`}>
                  {line.text}
                </div>
              ))}
              {currentStep < terminalSteps.length && (
                <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1"></span>
              )}
            </div>
          </Card>

          {/* Version Type Tabs */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'patch', emoji: '🐛', desc: '1.0.0 → 1.0.1' },
              { name: 'minor', emoji: '✨', desc: '1.0.0 → 1.1.0' },
              { name: 'major', emoji: '💥', desc: '1.0.0 → 2.0.0' },
              { name: 'alpha', emoji: '🔬', desc: '1.0.0-alpha.0' },
              { name: 'beta', emoji: '🚀', desc: '1.0.0-beta.0' },
            ].map((type) => (
              <Card key={type.name} className="p-4 text-center hover:border-yellow-300 transition-colors cursor-pointer">
                <div className="text-3xl mb-2">{type.emoji}</div>
                <div className="font-semibold text-gray-900">{type.name}</div>
                <div className="text-xs text-gray-600 mt-1">{type.desc}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
