import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mixykqblfvaiualzoblk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1peHlrcWJsZnZhaXVhbHpvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NjA5MjksImV4cCI6MjEwMTMzNjkyOX0.0la8p-bUMPd_1Va1_ZsSuDKpMxdefWqfczTZqRxSr-U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
