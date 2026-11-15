// Tells the app what is set up. The Supabase anon key is meant to be public (row level security protects the data).
// Never put the service_role key here.
import { send } from './_lib.js';
export default function handler(req, res) {
  send(res, 200, {
    ai: !!process.env.ANTHROPIC_API_KEY,
    needCode: !!process.env.CLASS_CODE,
    supabaseUrl: process.env.SUPABASE_URL || null,
    supabaseKey: process.env.SUPABASE_ANON_KEY || null
  });
}
