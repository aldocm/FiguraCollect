'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SelectBase } from '@/components/ui'

interface User {
  id: string
  email: string
  username: string
  name: string | null
  country: string
  role: string
  emailVerified: boolean
  createdAt: string
  _count: {
    userFigures: number
    lists: number
    reviews: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId)
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      fetchUsers()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('¿Seguro que quieres eliminar este usuario? Esta acción no se puede deshacer.')) return

    setUpdating(userId)
    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      fetchUsers()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-title font-bold text-textWhite">Gestión de Usuarios</h1>
        <Link href="/admin" className="text-textWhite/70 hover:text-accent transition-colors">
          ← Volver
        </Link>
      </div>

      {loading ? (
        <p className="text-textWhite/50 font-body">Cargando...</p>
      ) : (
        <div className="border border-textWhite/20 rounded-lg overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead className="bg-uiBase">
              <tr>
                <th className="text-left p-3 font-medium text-textWhite">Usuario</th>
                <th className="text-left p-3 font-medium text-textWhite">Email</th>
                <th className="text-left p-3 font-medium text-textWhite">País</th>
                <th className="text-left p-3 font-medium text-textWhite">Rol</th>
                <th className="text-left p-3 font-medium text-textWhite">Stats</th>
                <th className="text-left p-3 font-medium text-textWhite">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-textWhite/10">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-uiBase/50 transition-colors">
                  <td className="p-3">
                    <p className="font-medium text-textWhite">{user.username}</p>
                    {user.name && <p className="text-xs text-textWhite/50">{user.name}</p>}
                  </td>
                  <td className="p-3">
                    <p className="text-textWhite">{user.email}</p>
                    {!user.emailVerified && (
                      <span className="text-xs text-accent">No verificado</span>
                    )}
                  </td>
                  <td className="p-3 text-textWhite">{user.country}</td>
                  <td className="p-3">
                    <SelectBase
                      label="Rol"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={updating === user.id}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPERADMIN">SUPERADMIN</option>
                    </SelectBase>
                  </td>
                  <td className="p-3 text-xs text-textWhite/50">
                    {user._count.userFigures} figuras ·{' '}
                    {user._count.lists} listas ·{' '}
                    {user._count.reviews} reviews
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={updating === user.id}
                      className="text-primary hover:underline text-xs disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
