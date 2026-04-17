// One-time script to delete alexa@asistee.com from Supabase Auth
// Run: node scripts/delete-user.mjs

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://hkvxickkwkbrjqejfvzw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrdnhpY2trd2ticmpxZWpmdnp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE0NTI0OSwiZXhwIjoyMDkxNzIxMjQ5fQ.4mSRsJ9XYa_GTxWBY67etcsyfffaXd28agr4O5ayMRw',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const email = 'alexa@asistee.com'

// Find user
const { data: { users } } = await supabase.auth.admin.listUsers()
const user = users.find(u => u.email === email)

if (!user) {
  console.log(`User ${email} not found`)
  process.exit(0)
}

console.log(`Found user: ${user.id} (${user.email})`)

// Delete user
const { error } = await supabase.auth.admin.deleteUser(user.id)
if (error) {
  console.error('Delete error:', error.message)
} else {
  console.log(`✅ Deleted ${email}`)
}
