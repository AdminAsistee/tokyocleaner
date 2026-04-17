// One-time script to set admin role + password for admin@asistee.com
// Run: node scripts/setup-admin.mjs

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://hkvxickkwkbrjqejfvzw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrdnhpY2trd2ticmpxZWpmdnp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE0NTI0OSwiZXhwIjoyMDkxNzIxMjQ5fQ.4mSRsJ9XYa_GTxWBY67etcsyfffaXd28agr4O5ayMRw',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const email = 'admin@asistee.com'
const password = 'TC-Adm1n-2026'

const { data: { users } } = await supabase.auth.admin.listUsers()
const user = users.find(u => u.email === email)

if (!user) {
  console.log(`User ${email} not found`)
  process.exit(1)
}

console.log(`Found admin: ${user.id} (${user.email})`)

const { error } = await supabase.auth.admin.updateUserById(user.id, {
  password,
  app_metadata: { role: 'admin' },
})

if (error) {
  console.error('Update error:', error.message)
} else {
  console.log(`✅ Set role=admin and password for ${email}`)
  console.log(`   Password: ${password}`)
}
