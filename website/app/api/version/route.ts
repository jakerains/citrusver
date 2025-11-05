import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch latest version from npm registry
    const response = await fetch('https://registry.npmjs.org/citrusver/latest', {
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error('Failed to fetch version from npm')
    }

    const data = await response.json()
    const version = data.version

    return NextResponse.json({ version }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error fetching version:', error)
    // Fallback to a default version if npm fetch fails
    return NextResponse.json({ version: '3.0.6' }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60'
      }
    })
  }
}
