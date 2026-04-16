import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OrderDetailClient from './OrderDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch the booking with all related data
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      id,
      scheduled_date,
      scheduled_time,
      service_type,
      status,
      cleaning_price,
      notes,
      properties (name, address),
      cleanings (
        id,
        actual_hours,
        notes,
        cleaning_staff_assignments (
          staff (display_name, full_name)
        )
      ),
      order_photos (storage_path, photo_type)
    `)
    .eq('id', id)
    .single()

  if (error || !booking) {
    redirect('/dashboard')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <OrderDetailClient booking={booking as any} />
}
