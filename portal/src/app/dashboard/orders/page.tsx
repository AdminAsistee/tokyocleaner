import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OrdersClient from './OrdersClient'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const email = user.email?.toLowerCase() ?? ''

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, scheduled_date, scheduled_time, service_type, status, notes, properties (name, address)')
    .eq('customer_email', email)
    .order('scheduled_date', { ascending: false })

  return <OrdersClient user={user} bookings={(bookings ?? []) as any} />
}
