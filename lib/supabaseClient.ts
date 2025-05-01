// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // Get Supabase URL from environment variables
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Get Supabase anon key from environment variables
)

export default supabase
