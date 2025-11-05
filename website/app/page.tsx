import Hero from '@/components/hero'
import Features from '@/components/features'
import TerminalDemo from '@/components/terminal-demo'
import Documentation from '@/components/documentation'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-green-50">
      <Hero />
      <Features />
      <TerminalDemo />
      <Documentation />
      <Footer />
    </main>
  )
}
