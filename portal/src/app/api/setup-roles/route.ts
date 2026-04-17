import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * ONE-TIME setup route — sets roles and passwords for existing users.
 * DELETE THIS FILE after running it once.
 *
 * POST /api/setup-roles
 */
export async function POST() {
  try {
    const supabase = createAdminClient()

    const accounts = [
      { email: 'admin@asistee.com', role: 'admin', password: 'TC-Adm1n-2026' },
      { email: 'alexa@asistee.com', role: 'client', password: 'TC-Cl1ent-2026' },
    ]

    const results: Array<{ email: string; role: string; password: string; status: string }> = []

    for (const account of accounts) {
      // Find the user by email
      const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers()
      if (listErr) {
        results.push({ ...account, status: `Error listing users: ${listErr.message}` })
        continue
      }

      const user = users.find(u => u.email?.toLowerCase() === account.email.toLowerCase())
      if (!user) {
        results.push({ ...account, status: 'User not found' })
        continue
      }

      // Update role + password
      const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, {
        password: account.password,
        app_metadata: { role: account.role },
      })

      if (updateErr) {
        results.push({ ...account, status: `Error: ${updateErr.message}` })
      } else {
        results.push({ ...account, status: 'OK' })
      }
    }

    return NextResponse.json({ results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
