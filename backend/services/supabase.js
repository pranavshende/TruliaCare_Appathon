const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY; // Using secret key for admin privileges (uploading to buckets directly)

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
