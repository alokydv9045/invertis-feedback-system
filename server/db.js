import { supabase } from './lib/supabase.js';

// ── Verify Supabase connection on startup ───────────────────────────────────
export const initDb = async () => {
  try {
    console.log('Attempting connection to Supabase...');
    const { data, error } = await supabase.from('departments').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Connected to Supabase successfully.');
  } catch (err) {
    console.error('❌ Supabase connection failed:', err.message);
    process.exit(1);
  }
};

export { supabase };
export default supabase;
