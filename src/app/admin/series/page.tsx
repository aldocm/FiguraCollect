'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { InputBase, TextAreaBase } from '@/components/ui'

interface Series {
  id: string
  name: string
  slug: string
  description: string | null
  _count: { figures: number }
}

export default function AdminSeriesPage() {
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchSeries = async () => {
    const res = await fetch('/api/series')
    const data = await res.json()
    setSeries(data.series)
    setLoading(false)
  }

  useEffect(() => {
    fetchSeries()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const res = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setName('')
      setDescription('')
      fetchSeries()
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta serie?')) return

    await fetch(`/api/series/${id}`, { method: 'DELETE' })
    fetchSeries()
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-title text-textWhite">Series</h1>
        <Link href="/admin" className="text-textWhite/60 hover:text-accent transition-colors">
          ← Volver
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="border border-textWhite/20 rounded-lg p-6 bg-uiBase">
          <h2 className="font-title text-textWhite mb-4">Nueva Serie</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-primary/20 text-primary p-3 rounded text-sm">
                {error}
              </div>
            )}
            <InputBase
              label="Nombre *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextAreaBase
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-textWhite py-3 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear Serie'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="border border-textWhite/20 rounded-lg p-6 bg-uiBase">
          <h2 className="font-title text-textWhite mb-4">Series Existentes</h2>
          {loading ? (
            <p className="text-textWhite/50">Cargando...</p>
          ) : series.length === 0 ? (
            <p className="text-textWhite/50">No hay series</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {series.map(s => (
                <div key={s.id} className="flex justify-between items-center p-3 bg-background rounded">
                  <div>
                    <p className="font-medium text-textWhite">{s.name}</p>
                    <p className="text-xs text-textWhite/50">
                      {s._count.figures} figuras
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-primary text-sm hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
