import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, GitBranch, Palette, Package, Flag, Shield } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Zero Dependencies',
    description: 'Pure Node.js implementation with no external dependencies. Fast, lightweight, and reliable.',
    badge: 'Core'
  },
  {
    icon: Palette,
    title: 'Beautiful CLI',
    description: 'Gorgeous ASCII art, colorful output, and an intuitive interface that makes version management a pleasure.',
    badge: 'UX'
  },
  {
    icon: Flag,
    title: 'Flag-Based Workflow',
    description: 'Simple by default (version-only), with optional --commit, --tag, --push, and --full flags for git operations.',
    badge: 'v3.0'
  },
  {
    icon: GitBranch,
    title: 'Smart Git Integration',
    description: 'Optional git commit, tagging, and push with interactive commit messages. Only stages package files, not all changes.',
    badge: 'Git'
  },
  {
    icon: Package,
    title: 'Multiple Version Types',
    description: 'Support for patch, minor, major, alpha, beta, and custom prerelease versions with semantic versioning.',
    badge: 'SemVer'
  },
  {
    icon: Shield,
    title: 'Safe & Configurable',
    description: 'Hooks for pre/post version scripts, customizable commit templates, and dry-run mode to preview changes.',
    badge: 'Advanced'
  }
]

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Everything you need for version management
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            CitrusVer provides a simple, beautiful, and powerful way to manage your project versions
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="relative overflow-hidden border-2 hover:border-yellow-300 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="rounded-lg bg-yellow-100 p-3">
                      <Icon className="h-6 w-6 text-yellow-700" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Version Command Examples */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
            Choose your workflow
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Simple (v3.0 Default)</CardTitle>
                <CardDescription>Just update the version</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded bg-gray-900 p-3 font-mono text-sm">
                  <div className="text-green-400">$ citrusver patch</div>
                  <div className="text-gray-400 mt-1"># Updates package.json only</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">With Git Commit</CardTitle>
                <CardDescription>Version + commit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded bg-gray-900 p-3 font-mono text-sm">
                  <div className="text-green-400">$ citrusver patch --commit</div>
                  <div className="text-gray-400 mt-1"># Prompts for commit message</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">With Git Tag</CardTitle>
                <CardDescription>Version + commit + tag</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded bg-gray-900 p-3 font-mono text-sm">
                  <div className="text-green-400">$ citrusver minor --tag</div>
                  <div className="text-gray-400 mt-1"># Creates annotated git tag</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Full Workflow</CardTitle>
                <CardDescription>Version + commit + tag + push</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded bg-gray-900 p-3 font-mono text-sm">
                  <div className="text-green-400">$ citrusver major --full</div>
                  <div className="text-gray-400 mt-1"># Complete release workflow</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
