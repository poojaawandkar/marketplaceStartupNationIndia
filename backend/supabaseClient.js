// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wragnkdnvhyguszznvjw.supabase.co'; // replace this
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYWdua2Rudmh5Z3Vzenpudmp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MTk5MjksImV4cCI6MjA2OTE5NTkyOX0.bTHq6C3qHUIs2pfjWbUnmCWk0gudh6ke7Z9X57AIRwU'; // replace this

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
