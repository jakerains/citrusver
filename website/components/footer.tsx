import { Github, Twitter, Heart } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🍋</span>
              <span className="text-xl font-bold text-white">CitrusVer</span>
            </div>
            <p className="text-sm text-gray-400 mb-4 max-w-md">
              Fresh squeezed version management for Node.js projects. Beautiful, interactive, and powerful with zero dependencies.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/jakerains/citrusver"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/jakerains"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#docs" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://github.com/jakerains/citrusver/issues" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Issues
                </a>
              </li>
              <li>
                <a href="https://github.com/jakerains/citrusver/releases" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Changelog
                </a>
              </li>
              <li>
                <a href="https://www.npmjs.com/package/citrusver" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  NPM Package
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="https://github.com/jakerains/citrusver" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://github.com/jakerains/citrusver/discussions" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Discussions
                </a>
              </li>
              <li>
                <a href="https://github.com/jakerains/citrusver/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Contributing
                </a>
              </li>
              <li>
                <a href="https://jakerains.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Author
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> by{' '}
            <a href="https://jakerains.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-400 transition-colors">
              Jake Rains
            </a>
          </div>
          <div>
            © {new Date().getFullYear()} CitrusVer. MIT License.
          </div>
        </div>
      </div>
    </footer>
  )
}
