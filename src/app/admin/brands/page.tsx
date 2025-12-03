'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { InputBase, TextAreaBase } from '@/components/ui'

interface Brand {
  id: string
  name: string
  slug: string
  description: string | null
  _count: { lines: number; figures: number }
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchBrands = async () => {
    const res = await fetch('/api/brands')
    const data = await res.json()
    setBrands(data.brands)
    setLoading(false)
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const res = await fetch('/api/brands', {
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
      fetchBrands()
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta marca?')) return

    await fetch(`/api/brands/${id}`, { method: 'DELETE' })
    fetchBrands()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-title font-bold text-textWhite">Marcas</h1>
        <Link href="/admin" className="text-textWhite/70 hover:text-accent transition-colors">
          ← Volver
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="border border-textWhite/20 rounded-lg p-4 bg-background">
          <h2 className="font-title font-semibold mb-4 text-textWhite">Nueva Marca</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-primary/20 text-primary p-2 rounded text-sm font-body">
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
              className="w-full bg-primary text-textWhite py-3 rounded font-body text-sm hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear Marca'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="border border-textWhite/20 rounded-lg p-4 bg-background">
          <h2 className="font-title font-semibold mb-4 text-textWhite">Marcas Existentes</h2>
          {loading ? (
            <p className="text-textWhite/50 font-body">Cargando...</p>
          ) : brands.length === 0 ? (
            <p className="text-textWhite/50 font-body">No hay marcas</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {brands.map(brand => (
                <div key={brand.id} className="flex justify-between items-center p-3 bg-uiBase rounded">
                  <div>
                    <p className="font-body font-medium text-textWhite">{brand.name}</p>
                    <p className="text-xs text-textWhite/50 font-body">
                      {brand._count.lines} líneas · {brand._count.figures} figuras
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="text-primary text-sm hover:underline font-body"
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
