'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { InputBase, TextAreaBase, SelectBase } from '@/components/ui'

interface Brand {
  id: string
  name: string
}

interface Line {
  id: string
  name: string
  slug: string
  description: string | null
  releaseYear: number | null
  brand: Brand
  _count: { figures: number }
}

export default function AdminLinesPage() {
  const [lines, setLines] = useState<Line[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [brandId, setBrandId] = useState('')
  const [releaseYear, setReleaseYear] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    const [linesRes, brandsRes] = await Promise.all([
      fetch('/api/lines'),
      fetch('/api/brands')
    ])
    const linesData = await linesRes.json()
    const brandsData = await brandsRes.json()
    setLines(linesData.lines)
    setBrands(brandsData.brands)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const res = await fetch('/api/lines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          brandId,
          releaseYear: releaseYear ? parseInt(releaseYear) : null
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setName('')
      setDescription('')
      setBrandId('')
      setReleaseYear('')
      fetchData()
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta línea?')) return

    await fetch(`/api/lines/${id}`, { method: 'DELETE' })
    fetchData()
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-title text-textWhite">Líneas</h1>
        <Link href="/admin" className="text-textWhite/60 hover:text-accent transition-colors">
          ← Volver
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="border border-textWhite/20 rounded-lg p-6 bg-uiBase">
          <h2 className="font-title text-textWhite mb-4">Nueva Línea</h2>
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
            <SelectBase
              label="Marca *"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              required
            >
              <option value="">Selecciona una marca</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </SelectBase>
            <InputBase
              type="number"
              label="Año de lanzamiento"
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
              min={1990}
              max={2030}
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
              {saving ? 'Guardando...' : 'Crear Línea'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="border border-textWhite/20 rounded-lg p-6 bg-uiBase">
          <h2 className="font-title text-textWhite mb-4">Líneas Existentes</h2>
          {loading ? (
            <p className="text-textWhite/50">Cargando...</p>
          ) : lines.length === 0 ? (
            <p className="text-textWhite/50">No hay líneas</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {lines.map(line => (
                <div key={line.id} className="flex justify-between items-center p-3 bg-background rounded">
                  <div>
                    <p className="font-medium text-textWhite">{line.name}</p>
                    <p className="text-xs text-textWhite/50">
                      {line.brand.name} · {line._count.figures} figuras
                      {line.releaseYear && ` · ${line.releaseYear}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(line.id)}
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
