import RegisterClient from './RegisterClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Registro | FiguraCollect',
  description: 'Crea tu cuenta y únete a la comunidad de coleccionistas.'
}

export default function RegisterPage() {
  return <RegisterClient />
}