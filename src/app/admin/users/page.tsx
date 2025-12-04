import UsersClient from './UsersClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestión de Usuarios | Admin'
}

export default function AdminUsersPage() {
  return <UsersClient />
}
