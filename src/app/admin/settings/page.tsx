import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'SUPERADMIN') {
    redirect('/admin')
  }

  return <SettingsClient />
}
