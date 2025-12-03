'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { InputBase } from '@/components/ui'

interface Tag {
  id: string
  name: string
  _count: { figures: number }
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchTags = async () => {
    const res = await fetch('/api/tags')
    const data = await res.json()
    setTags(data.tags)
    setLoading(false)
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setName('')
      fetchTags()
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este tag?')) return

    await fetch(`/api/tags/${id}`, { method: 'DELETE' })
    fetchTags()
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-title text-textWhite">Tags</h1>
        <Link href="/admin" className="text-textWhite/60 hover:text-accent transition-colors">
          ← Volver
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="border border-textWhite/20 rounded-lg p-6 bg-uiBase">
          <h2 className="font-title text-textWhite mb-4">Nuevo Tag</h2>
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
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-textWhite py-3 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear Tag'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="border border-textWhite/20 rounded-lg p-6 bg-uiBase">
          <h2 className="font-title text-textWhite mb-4">Tags Existentes</h2>
          {loading ? (
            <p className="text-textWhite/50">Cargando...</p>
          ) : tags.length === 0 ? (
            <p className="text-textWhite/50">No hay tags</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-2 bg-background px-3 py-2 rounded text-sm text-textWhite"
                >
                  {tag.name}
                  <span className="text-xs text-textWhite/50">({tag._count.figures})</span>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="text-primary hover:text-primary/80 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
