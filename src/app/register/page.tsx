import RegisterClient from './RegisterClient'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Registro | FiguraCollect',
  description: 'Crea tu cuenta y únete a la comunidad de coleccionistas.'
}

export default async function RegisterPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect('/')
  }

  return <RegisterClient />
}
