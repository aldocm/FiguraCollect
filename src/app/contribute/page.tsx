import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import ContributeClient from './ContributeClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contribuir | FiguraCollect'
}

export default async function ContributePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return <ContributeClient />
}
