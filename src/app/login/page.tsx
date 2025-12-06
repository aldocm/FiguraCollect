import LoginClient from './LoginClient'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Iniciar Sesión | FiguraCollect',
  description: 'Ingresa a tu cuenta para gestionar tu colección.'
}

export default async function LoginPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect('/')
  }

  return <LoginClient />
}
