// Quick check of admin@asistee.com's current auth state
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://hkvxickkwkbrjqejfvzw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrdnhpY2trd2ticmpxZWpmdnp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE0NTI0OSwiZXhwIjoyMDkxNzIxMjQ5fQ.4mSRsJ9XYa_GTxWBY67etcsyfffaXd28agr4O5ayMRw',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const { data: { users } } = await supabase.auth.admin.listUsers()

for (const u of users) {
  console.log(`${u.email} | role: ${u.app_metadata?.role || 'NONE'} | id: ${u.id}`)
}
