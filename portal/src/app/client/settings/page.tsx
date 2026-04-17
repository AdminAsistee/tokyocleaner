import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch client record linked to this auth user
  const { data: clientData } = await supabase
    .from('clients')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  return <SettingsClient user={user} clientRecord={clientData} />
}
