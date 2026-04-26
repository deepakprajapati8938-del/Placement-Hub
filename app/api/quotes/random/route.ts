import { NextRequest, NextResponse } from 'next/server'
import motivationalQuotes from '@/lib/quotes/motivational.json'
import savageQuotes from '@/lib/quotes/savage.json'

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json()

    if (!type || !['motivational', 'savage'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid quote type' },
        { status: 400 }
      )
    }

    const quotes = type === 'savage' ? savageQuotes : motivationalQuotes
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

    return NextResponse.json({
      quote: randomQuote,
      type
    })
  } catch (error) {
    console.error('Error fetching random quote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
