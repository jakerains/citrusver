import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Documentation() {
  return (
    <section id="docs" className="py-24 sm:py-32 px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Documentation
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Everything you need to get started with CitrusVer
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <Tabs defaultValue="quickstart" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
              <TabsTrigger value="flags">CLI Flags</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="migration">v3.0 Migration</TabsTrigger>
            </TabsList>

            {/* Quick Start Tab */}
            <TabsContent value="quickstart" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Installation</CardTitle>
                  <CardDescription>Choose your preferred installation method</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Compiled Binary (Recommended)</h4>
                    <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400">
                      curl -fsSL https://citrusver.jakerains.com/install.sh | bash
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">NPM (No installation needed)</h4>
                    <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400">
                      npx citrusver patch
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Global Install</h4>
                    <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400">
                      npm install -g citrusver
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Basic Usage</CardTitle>
                  <CardDescription>Version bumping made simple</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm">
                    <div className="text-gray-400"># Simple version bump (v3.0 default)</div>
                    <div className="text-green-400">citrusver patch</div>
                    <div className="text-gray-500 mt-2"># Updates package.json only</div>
                  </div>
                  <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm">
                    <div className="text-gray-400"># With git commit</div>
                    <div className="text-green-400">citrusver minor --commit</div>
                    <div className="text-gray-500 mt-2"># Prompts for commit message</div>
                  </div>
                  <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm">
                    <div className="text-gray-400"># Full workflow (commit + tag + push)</div>
                    <div className="text-green-400">citrusver major --full</div>
                    <div className="text-gray-500 mt-2"># Complete release workflow</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CLI Flags Tab */}
            <TabsContent value="flags" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>CLI Flags Reference</CardTitle>
                  <CardDescription>Control your version workflow with flags</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        flag: '--commit',
                        description: 'Version bump + git commit (prompts for message)',
                        example: 'citrusver patch --commit',
                      },
                      {
                        flag: '--tag',
                        description: 'Version bump + commit + annotated tag (implies --commit)',
                        example: 'citrusver minor --tag',
                      },
                      {
                        flag: '--push',
                        description: 'Version bump + commit + push to remote (implies --commit)',
                        example: 'citrusver major --push',
                      },
                      {
                        flag: '--full',
                        description: 'Complete workflow with all advanced features',
                        example: 'citrusver patch --full',
                      },
                      {
                        flag: '--preid <id>',
                        description: 'Prerelease identifier (alpha, beta, rc, canary, etc.)',
                        example: 'citrusver prerelease --preid=rc',
                      },
                      {
                        flag: '--quiet',
                        description: 'Minimal output (just version number)',
                        example: 'citrusver patch --quiet',
                      },
                      {
                        flag: '--dry-run',
                        description: 'Preview changes without executing',
                        example: 'citrusver minor --dry-run',
                      },
                    ].map((item) => (
                      <div key={item.flag} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">
                            {item.flag}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="rounded bg-gray-900 p-2 font-mono text-xs text-green-400">
                          {item.example}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configuration Tab */}
            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration File</CardTitle>
                  <CardDescription>Create a .citrusver.json in your project root</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                    <pre>{`{
  "messageStyle": "conventional",
  "autoTag": true,
  "autoPush": false,
  "preVersion": "npm test",
  "postVersion": "npm run build",
  "commitTemplate": "{{type}}: {{message}}"
}`}</pre>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">messageStyle</h4>
                      <p className="text-sm text-gray-600">
                        Commit message style: <code className="text-xs bg-gray-100 px-1 rounded">interactive</code>,{' '}
                        <code className="text-xs bg-gray-100 px-1 rounded">conventional</code>, or{' '}
                        <code className="text-xs bg-gray-100 px-1 rounded">simple</code>
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">autoTag</h4>
                      <p className="text-sm text-gray-600">
                        Automatically create git tags (only applies with --commit, --push, or --full)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">autoPush</h4>
                      <p className="text-sm text-gray-600">
                        Automatically push to remote (only applies with --commit or --full)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">preVersion / postVersion</h4>
                      <p className="text-sm text-gray-600">
                        Commands to run before/after version bump (only with git operation flags)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Migration Tab */}
            <TabsContent value="migration" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>v3.0 Migration Guide</CardTitle>
                  <CardDescription>Upgrading from v2.x to v3.0</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Breaking Change</h4>
                    <p className="text-sm text-yellow-800">
                      In v3.0, the default behavior only updates package.json. Git operations (commit, tag, push) are now opt-in via flags.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Command Equivalents</h4>
                    <div className="space-y-2">
                      {[
                        {
                          v2: 'citrusver patch',
                          v3: 'citrusver patch --tag',
                          desc: 'Auto commit + tag behavior',
                        },
                        {
                          v2: 'citrusver patch (with autoPush: true)',
                          v3: 'citrusver patch --push',
                          desc: 'Auto push to remote',
                        },
                        {
                          v2: 'N/A',
                          v3: 'citrusver patch',
                          desc: 'Simple version bump (new in v3.0)',
                        },
                      ].map((item, index) => (
                        <div key={index} className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded">
                          <div>
                            <div className="text-xs text-gray-600 mb-1">v2.x</div>
                            <code className="text-sm bg-white px-2 py-1 rounded">{item.v2}</code>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 mb-1">v3.0</div>
                            <code className="text-sm bg-white px-2 py-1 rounded">{item.v3}</code>
                          </div>
                          <div className="col-span-2 text-xs text-gray-600 mt-1">{item.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Benefits of v3.0</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li>Simpler default behavior - just update version files</li>
                      <li>More predictable - no surprise git operations</li>
                      <li>Faster - no git validation when not needed</li>
                      <li>Flexible - choose exactly what you want with flags</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
