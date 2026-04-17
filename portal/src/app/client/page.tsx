import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const email = user.email?.toLowerCase() ?? ''
  const today = new Date().toISOString().split('T')[0]

  // Fetch client record
  const { data: clientRecord } = await supabase
    .from('clients')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  // Count properties owned by this client
  const { count: propertyCount } = await supabase
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientRecord?.id ?? -1)

  // 1. Next upcoming booking
  const { data: nextBooking } = await supabase
    .from('bookings')
    .select('id, scheduled_date, scheduled_time, service_type, status, notes, properties (name, address)')
    .eq('customer_email', email)
    .gte('scheduled_date', today)
    .neq('status', 'completed')
    .neq('status', 'cancelled')
    .order('scheduled_date', { ascending: true })
    .limit(1)
    .single()

  // 2. Recent bookings
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('id, scheduled_date, scheduled_time, service_type, status, notes, properties (name, address)')
    .eq('customer_email', email)
    .order('scheduled_date', { ascending: false })
    .limit(5)

  // 3. Total counts
  const { count: totalCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('customer_email', email)

  const { count: upcomingCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('customer_email', email)
    .gte('scheduled_date', today)
    .neq('status', 'completed')
    .neq('status', 'cancelled')

  // Check if password was changed (user has updated_at after created_at)
  const hasChangedPassword = !!(user.user_metadata?.password_changed)

  return (
    <DashboardClient
      user={user}
      nextBooking={nextBooking as any}
      recentBookings={(recentBookings ?? []) as any}
      totalCount={totalCount ?? 0}
      upcomingCount={upcomingCount ?? 0}
      clientRecord={clientRecord as any}
      propertyCount={propertyCount ?? 0}
      hasChangedPassword={hasChangedPassword}
    />
  )
}
