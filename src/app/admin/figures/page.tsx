'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { InputBase, TextAreaBase, SelectBase } from '@/components/ui'

interface Brand { id: string; name: string }
interface Line { id: string; name: string; brandId: string }
interface Series { id: string; name: string }
interface Tag { id: string; name: string }

interface Figure {
  id: string
  name: string
  brand: Brand
  line: { name: string }
  priceMXN: number | null
  releaseDate: string | null
  isReleased: boolean
}

export default function AdminFiguresPage() {
  const [figures, setFigures] = useState<Figure[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [lines, setLines] = useState<Line[]>([])
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    sku: '',
    size: '',
    scale: '',
    material: '',
    maker: '',
    priceMXN: '',
    priceUSD: '',
    priceYEN: '',
    releaseDate: '',
    isReleased: false,
    isNSFW: false,
    brandId: '',
    lineId: '',
    images: '',
    tagIds: [] as string[],
    seriesIds: [] as string[]
  })

  const fetchData = async () => {
    const [figuresRes, brandsRes, linesRes, seriesRes, tagsRes] = await Promise.all([
      fetch('/api/figures?limit=100'),
      fetch('/api/brands'),
      fetch('/api/lines'),
      fetch('/api/series'),
      fetch('/api/tags')
    ])

    const [figuresData, brandsData, linesData, seriesData, tagsData] = await Promise.all([
      figuresRes.json(),
      brandsRes.json(),
      linesRes.json(),
      seriesRes.json(),
      tagsRes.json()
    ])

    setFigures(figuresData.figures)
    setBrands(brandsData.brands)
    setLines(linesData.lines)
    setSeriesList(seriesData.series)
    setTags(tagsData.tags)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredLines = lines.filter(l => l.brandId === form.brandId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const images = form.images
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0)

      const res = await fetch('/api/figures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          sku: form.sku || null,
          size: form.size || null,
          scale: form.scale || null,
          material: form.material || null,
          maker: form.maker || null,
          priceMXN: form.priceMXN ? parseFloat(form.priceMXN) : null,
          priceUSD: form.priceUSD ? parseFloat(form.priceUSD) : null,
          priceYEN: form.priceYEN ? parseFloat(form.priceYEN) : null,
          releaseDate: form.releaseDate || null,
          isReleased: form.isReleased,
          isNSFW: form.isNSFW,
          brandId: form.brandId,
          lineId: form.lineId,
          images,
          tagIds: form.tagIds,
          seriesIds: form.seriesIds
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setForm({
        name: '',
        description: '',
        sku: '',
        size: '',
        scale: '',
        material: '',
        maker: '',
        priceMXN: '',
        priceUSD: '',
        priceYEN: '',
        releaseDate: '',
        isReleased: false,
        isNSFW: false,
        brandId: '',
        lineId: '',
        images: '',
        tagIds: [],
        seriesIds: []
      })
      fetchData()
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta figura?')) return

    await fetch(`/api/figures/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const toggleTag = (tagId: string) => {
    setForm(f => ({
      ...f,
      tagIds: f.tagIds.includes(tagId)
        ? f.tagIds.filter(id => id !== tagId)
        : [...f.tagIds, tagId]
    }))
  }

  const toggleSeries = (seriesId: string) => {
    setForm(f => ({
      ...f,
      seriesIds: f.seriesIds.includes(seriesId)
        ? f.seriesIds.filter(id => id !== seriesId)
        : [...f.seriesIds, seriesId]
    }))
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-title text-textWhite">Figuras</h1>
        <Link href="/admin" className="text-textWhite/60 hover:text-accent transition-colors">
          ← Volver
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="border border-textWhite/20 rounded-lg p-6 bg-uiBase">
          <h2 className="font-title text-textWhite mb-4">Nueva Figura</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-primary/20 text-primary p-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <InputBase
                label="Nombre *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <InputBase
                label="SKU"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectBase
                label="Marca *"
                value={form.brandId}
                onChange={(e) => setForm({ ...form, brandId: e.target.value, lineId: '' })}
                required
              >
                <option value="">Selecciona</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </SelectBase>
              <SelectBase
                label="Línea *"
                value={form.lineId}
                onChange={(e) => setForm({ ...form, lineId: e.target.value })}
                required
                disabled={!form.brandId}
              >
                <option value="">Selecciona</option>
                {filteredLines.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </SelectBase>
            </div>

            <TextAreaBase
              label="Descripción"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />

            <div className="grid grid-cols-3 gap-4">
              <InputBase
                label="Tamaño"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
              />
              <InputBase
                label="Escala"
                value={form.scale}
                onChange={(e) => setForm({ ...form, scale: e.target.value })}
              />
              <InputBase
                label="Material"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <InputBase
                type="number"
                label="Precio MXN"
                value={form.priceMXN}
                onChange={(e) => setForm({ ...form, priceMXN: e.target.value })}
                step="0.01"
              />
              <InputBase
                type="number"
                label="Precio USD"
                value={form.priceUSD}
                onChange={(e) => setForm({ ...form, priceUSD: e.target.value })}
                step="0.01"
              />
              <InputBase
                type="number"
                label="Precio YEN"
                value={form.priceYEN}
                onChange={(e) => setForm({ ...form, priceYEN: e.target.value })}
                step="1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputBase
                label="Fecha lanzamiento"
                value={form.releaseDate}
                onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
                placeholder="YYYY-MM"
              />
              <InputBase
                label="Fabricante"
                value={form.maker}
                onChange={(e) => setForm({ ...form, maker: e.target.value })}
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-textWhite cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isReleased}
                  onChange={(e) => setForm({ ...form, isReleased: e.target.checked })}
                  className="w-4 h-4 accent-accent"
                />
                Ya lanzada
              </label>
              <label className="flex items-center gap-2 text-sm text-textWhite cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isNSFW}
                  onChange={(e) => setForm({ ...form, isNSFW: e.target.checked })}
                  className="w-4 h-4 accent-accent"
                />
                NSFW
              </label>
            </div>

            <div>
              <label className="block text-sm text-textWhite/70 mb-2">Series</label>
              <div className="flex flex-wrap gap-2">
                {seriesList.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSeries(s.id)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      form.seriesIds.includes(s.id)
                        ? 'bg-accent text-white'
                        : 'bg-textWhite/10 text-textWhite/70 hover:bg-textWhite/20'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-textWhite/70 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      form.tagIds.includes(t.id)
                        ? 'bg-primary text-white'
                        : 'bg-textWhite/10 text-textWhite/70 hover:bg-textWhite/20'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <TextAreaBase
              label="URLs de imágenes (una por línea)"
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              rows={3}
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-textWhite py-3 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear Figura'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="border border-textWhite/20 rounded-lg p-6 bg-uiBase">
          <h2 className="font-title text-textWhite mb-4">Figuras ({figures.length})</h2>
          {loading ? (
            <p className="text-textWhite/50">Cargando...</p>
          ) : figures.length === 0 ? (
            <p className="text-textWhite/50">No hay figuras</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {figures.map(figure => (
                <div key={figure.id} className="flex justify-between items-center p-3 bg-background rounded">
                  <div>
                    <Link href={`/catalog/${figure.id}`} className="font-medium text-textWhite hover:text-accent transition-colors">
                      {figure.name}
                    </Link>
                    <p className="text-xs text-textWhite/50">
                      {figure.brand.name} · {figure.line.name}
                      {figure.priceMXN && ` · $${figure.priceMXN} MXN`}
                      {!figure.isReleased && figure.releaseDate && ` · ${figure.releaseDate}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(figure.id)}
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
