import { createClient } from '@supabase/supabase-js';

export default async (req: Request) => {
  console.log('Running scheduled rank refresh...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Service Role Key missing');
    return new Response('Configuration missing', { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { error } = await supabase.rpc('refresh_leaderboard_rank');

    if (error) {
      console.error('Error refreshing leaderboard rank:', error);
      return new Response('Failed to refresh leaderboard rank', { status: 500 });
    }

    console.log('Leaderboard rank refreshed successfully');
    return new Response('Leaderboard rank refreshed successfully', { status: 200 });
  } catch (error) {
    console.error('Error in refresh rank cron:', error);
    return new Response('Internal server error', { status: 500 });
  }
};

export const config = {
  schedule: "@hourly"
};
