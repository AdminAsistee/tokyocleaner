import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://hkvxickkwkbrjqejfvzw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrdnhpY2trd2ticmpxZWpmdnp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE0NTI0OSwiZXhwIjoyMDkxNzIxMjQ5fQ.4mSRsJ9XYa_GTxWBY67etcsyfffaXd28agr4O5ayMRw',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Add phone_number column to clients table
// Try inserting with phone_number to see if it exists
const { error } = await supabase.from('clients').insert({
  name: '__phone_test__',
  phone_number: '+81-90-0000-0000',
}).select('*').single()

if (error && error.code === 'PGRST204') {
  console.log('Column does not exist yet. Please add it via Supabase Dashboard:')
  console.log('ALTER TABLE clients ADD COLUMN phone_number TEXT;')
} else if (error) {
  console.log('Error:', error.message, error.code)
} else {
  console.log('✅ phone_number column exists!')
  await supabase.from('clients').delete().eq('name', '__phone_test__')
  console.log('Cleaned up test row')
}
