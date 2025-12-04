'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, Trash2, Shield, Mail, MapPin, User as UserIcon, AlertTriangle, X, Edit2, Crown } from 'lucide-react'

interface User {
  id: string
  email: string
  username: string
  name: string | null
  country: string
  role: string
  isPro: boolean
  emailVerified: boolean
  createdAt: string
  _count: {
    userFigures: number
    lists: number
    reviews: number
  }
}

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
    username: '',
    name: '',
    country: '',
    email: ''
  })

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

  const handleEditClick = (user: User) => {
    setEditingUser(user)
    setEditForm({
        username: user.username,
        name: user.name || '',
        country: user.country,
        email: user.email
    })
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    
    setUpdating(editingUser.id)
    try {
      await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username: editForm.username,
            name: editForm.name,
            country: editForm.country,
            email: editForm.email
        })
      })
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setUpdating(null)
    }
  }

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

  const handleTogglePro = async (userId: string, currentIsPro: boolean) => {
    setUpdating(userId)
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPro: !currentIsPro })
      })
      setUsers(users.map(u => u.id === userId ? { ...u, isPro: !currentIsPro } : u))
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

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4"
            >
                <Link 
                    href="/admin" 
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                >
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-title font-black text-white">Usuarios</h1>
                    <p className="text-gray-400 text-sm">Gestión de roles y accesos</p>
                </div>
            </motion.div>
        </div>

        {/* Search Bar */}
        <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="relative mb-8 max-w-2xl"
        >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
                type="text" 
                placeholder="Buscar usuarios por nombre o email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-uiBase/30 backdrop-blur-sm border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-white/30 transition-all shadow-lg"
            />
        </motion.div>

        {/* Results */}
        {loading ? (
            <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-uiBase/20 rounded-3xl border border-white/5 border-dashed">
                <p className="text-gray-500">No se encontraron usuarios.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence mode='popLayout'>
                    {filteredUsers.map(user => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={user.id}
                            className="group bg-uiBase/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:bg-uiBase/60 hover:border-white/20 transition-all relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-300 border border-white/5">
                                        <UserIcon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white leading-tight">{user.username}</h3>
                                        <p className="text-xs text-gray-400">{user.name || 'Sin nombre'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEditClick(user)}
                                        className="p-2 rounded-lg text-gray-600 hover:text-white hover:bg-white/10 transition-colors"
                                        title="Editar Detalles"
                                        disabled={updating === user.id}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(user.id)}
                                        className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        title="Eliminar"
                                        disabled={updating === user.id}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2 text-sm text-gray-400 mb-4">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} />
                                    <span className="truncate">{user.email}</span>
                                    {!user.emailVerified && <span className="text-yellow-500 text-[10px] font-bold bg-yellow-500/10 px-1.5 rounded">No verificado</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} />
                                    <span>{user.country}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-4 bg-black/20 rounded-xl p-2 border border-white/5">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Figs</p>
                                    <p className="text-white font-bold">{user._count.userFigures}</p>
                                </div>
                                <div className="text-center border-l border-white/10">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Listas</p>
                                    <p className="text-white font-bold">{user._count.lists}</p>
                                </div>
                                <div className="text-center border-l border-white/10">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Rev</p>
                                    <p className="text-white font-bold">{user._count.reviews}</p>
                                </div>
                            </div>

                            {/* Pro Toggle & Role Selector */}
                            <div className="flex gap-2">
                                {/* Pro Toggle */}
                                <button
                                    onClick={() => handleTogglePro(user.id, user.isPro)}
                                    disabled={updating === user.id}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                        user.isPro
                                            ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30'
                                            : 'bg-black/40 border border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
                                    }`}
                                    title={user.isPro ? 'Quitar PRO' : 'Hacer PRO'}
                                >
                                    <Crown size={14} />
                                    PRO
                                </button>

                                {/* Role Selector */}
                                <div className="relative flex-1">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        disabled={updating === user.id}
                                        className={`w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer font-bold ${
                                            user.role === 'SUPERADMIN' ? 'text-purple-400' :
                                            user.role === 'ADMIN' ? 'text-blue-400' : 'text-white'
                                        }`}
                                    >
                                        <option value="USER" className="bg-gray-900 text-white">USER</option>
                                        <option value="ADMIN" className="bg-gray-900 text-blue-400">ADMIN</option>
                                        <option value="SUPERADMIN" className="bg-gray-900 text-purple-400">SUPERADMIN</option>
                                    </select>
                                    <Shield size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>
                            </div>

                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        )}

        {/* Edit Modal */}
        <AnimatePresence>
            {editingUser && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setEditingUser(null)}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Editar Usuario</h2>
                            <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Username</label>
                                <input 
                                    value={editForm.username}
                                    onChange={e => setEditForm({...editForm, username: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Email</label>
                                <input 
                                    value={editForm.email}
                                    onChange={e => setEditForm({...editForm, email: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Nombre Completo</label>
                                <input 
                                    value={editForm.name}
                                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">País</label>
                                <input 
                                    value={editForm.country}
                                    onChange={e => setEditForm({...editForm, country: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 transition-all"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors font-bold"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 transition-colors"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  )
}
