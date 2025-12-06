import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import HomeConfigClient from './HomeConfigClient'

export default async function HomeConfigPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'SUPERADMIN') {
    redirect('/admin')
  }

  return <HomeConfigClient />
}
