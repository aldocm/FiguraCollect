'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, Plus, Trash2, Library, Box, X, Save, Edit2 } from 'lucide-react'

interface Series {
  id: string
  name: string
  slug: string
  description: string | null
  _count: { figures: number }
}

export default function SeriesClient() {
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Form States
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchSeries = async () => {
    const res = await fetch('/api/series')
    const data = await res.json()
    setSeries(data.series)
    setLoading(false)
  }

  useEffect(() => {
    fetchSeries()
  }, [])

  const handleEdit = (s: Series) => {
    setEditingId(s.id)
    setName(s.name)
    setDescription(s.description || '')
    setError('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setName('')
    setDescription('')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const url = editingId ? `/api/series/${editingId}` : '/api/series'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      handleCancelEdit()
      fetchSeries()
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta serie?')) return
    setSeries(series.filter(s => s.id !== id))
    await fetch(`/api/series/${id}`, { method: 'DELETE' })
    fetchSeries()
  }

  const filteredSeries = series.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex-1 bg-background pb-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-2 md:px-4 py-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4 mb-4 md:mb-8">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 md:gap-4"
            >
                <Link
                    href="/admin"
                    className="p-1.5 md:p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-title font-black text-white">Series</h1>
                    <p className="text-gray-400 text-xs md:text-sm">Franquicias y orígenes</p>
                </div>
            </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">

            {/* Left Column: Create Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-4 h-fit sticky top-8"
            >
                <div className="bg-uiBase/40 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                {editingId ? <Edit2 className="w-4 h-4 md:w-5 md:h-5" /> : <Plus className="w-4 h-4 md:w-5 md:h-5" />}
                            </div>
                            <h2 className="text-base md:text-lg font-bold text-white">{editingId ? 'Editar Serie' : 'Nueva Serie'}</h2>
                        </div>
                        {editingId && (
                            <button
                                onClick={handleCancelEdit}
                                className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-2 md:p-3 rounded-xl text-xs md:text-sm flex items-center gap-2">
                                <X size={16} /> {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nombre</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                placeholder="Ej. Dragon Ball Z"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Descripción</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                                placeholder="Opcional..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 md:py-4 rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group text-sm md:text-base"
                        >
                            {saving ? 'Guardando...' : (
                                <>
                                    <Save size={18} className="group-hover:scale-110 transition-transform" />
                                    {editingId ? 'Actualizar Serie' : 'Crear Serie'}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>

            {/* Right Column: List */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-8"
            >
                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar series..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-uiBase/30 backdrop-blur-sm border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-white/30 transition-all shadow-lg"
                    />
                </div>

                {/* Results */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Cargando...</div>
                ) : filteredSeries.length === 0 ? (
                    <div className="text-center py-12 bg-uiBase/20 rounded-3xl border border-white/5 border-dashed">
                        <p className="text-gray-500">No se encontraron series.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence mode='popLayout'>
                            {filteredSeries.map(series => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={series.id}
                                    className={`group bg-uiBase/40 backdrop-blur-md border rounded-2xl p-5 transition-all ${editingId === series.id ? 'border-purple-500/50 ring-1 ring-purple-500/50 bg-purple-500/5' : 'border-white/5 hover:bg-uiBase/60 hover:border-white/20'}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 rounded-xl bg-white/5 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                                            <Library size={24} />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => handleEdit(series)}
                                                className="p-2 rounded-lg text-gray-600 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(series.id)}
                                                className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-white mb-1">{series.name}</h3>
                                    {series.description && (
                                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{series.description}</p>
                                    )}

                                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Box size={14} />
                                            <span className="font-bold text-white">{series._count.figures}</span> Figuras
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>

        </div>
      </div>
    </div>
  )
}
