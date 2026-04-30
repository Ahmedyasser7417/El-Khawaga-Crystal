// ==========================================
// Supabase Configuration
// Replace with your actual Supabase project credentials
// ==========================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://nwhdvynozcbbacmrahjc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53aGR2eW5vemNiYmFjbXJhaGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTMzNDMsImV4cCI6MjA5MzEyOTM0M30.JxMY-8aI5seihlmmWPELhI7DuVfy-jlQo2VXxPPHQps";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

