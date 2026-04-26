const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Checking database state...');
  
  try {
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id, full_name, xp');
    console.log('Profiles:', profiles ? profiles.length : 0, pError ? pError.message : 'OK');

    const { data: phases, error: phError } = await supabase.from('roadmap_phases').select('id, title');
    console.log('Phases:', phases ? phases.length : 0, phError ? phError.message : 'OK');

    const { data: tasks, error: tError } = await supabase.from('tasks').select('id, title, phase_id');
    console.log('Tasks:', tasks ? tasks.length : 0, tError ? tError.message : 'OK');

    const { data: notes, error: nError } = await supabase.from('notes').select('id, title, phase_id');
    console.log('Notes:', notes ? notes.length : 0, nError ? nError.message : 'OK');
  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

checkData();
