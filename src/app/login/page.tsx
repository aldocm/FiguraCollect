import LoginClient from './LoginClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión | FiguraCollect',
  description: 'Ingresa a tu cuenta para gestionar tu colección.'
}

export default function LoginPage() {
  return <LoginClient />
}