import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Refresh the leaderboard_rank materialized view
    const { error } = await supabase.rpc('refresh_leaderboard_rank')

    if (error) {
      console.error('Error refreshing leaderboard rank:', error)
      return NextResponse.json(
        { error: 'Failed to refresh leaderboard rank' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Leaderboard rank refreshed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in refresh rank cron:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
