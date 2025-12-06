'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, Plus, Trash2, Box, X, Save, Image as ImageIcon, DollarSign, Calendar, Ruler, Tag, ChevronDown, ExternalLink, Edit2, Clock, Rocket, CheckCircle, ArrowLeftRight, User } from 'lucide-react'
import { InputBase, TextAreaBase, SelectBase } from '@/components/ui'
import { inchesToCm, cmToInches, type MeasureUnit } from '@/lib/utils'

interface Brand { id: string; name: string }
interface Line { id: string; name: string; brandId: string }
interface Series { id: string; name: string }
interface TagType { id: string; name: string }
interface Character { id: string; name: string; series: { id: string; name: string } | null }

interface Figure {
  id: string
  name: string
  brand: Brand
  line: { name: string }
  priceMXN: number | null
  releaseDate: string | null
  isReleased: boolean
  images: { url: string }[]
}

export default function FiguresClient() {
  const [figures, setFigures] = useState<Figure[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [lines, setLines] = useState<Line[]>([])
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // New Character Modal
  const [showNewCharacterModal, setShowNewCharacterModal] = useState(false)
  const [newCharacterName, setNewCharacterName] = useState('')
  const [newCharacterSeriesId, setNewCharacterSeriesId] = useState('')
  const [savingCharacter, setSavingCharacter] = useState(false)
  
  // Form
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    sku: '',
    heightCm: '',
    widthCm: '',
    depthCm: '',
    scale: '',
    material: '',
    maker: '',
    priceMXN: '',
    priceUSD: '',
    priceYEN: '',
    originalPriceCurrency: 'YEN', // Default
    releaseDate: '',
    isReleased: false,
    isNSFW: false,
    brandId: '',
    lineId: '',
    characterId: '',
    images: '',
    tagIds: [] as string[],
    seriesIds: [] as string[]
  })

  // Unit for dimension input (cm or inches)
  const [dimensionUnit, setDimensionUnit] = useState<MeasureUnit>('cm')

  const fetchData = async () => {
    const [figuresRes, brandsRes, linesRes, seriesRes, tagsRes, charactersRes] = await Promise.all([
      fetch('/api/figures?limit=100'),
      fetch('/api/brands'),
      fetch('/api/lines'),
      fetch('/api/series'),
      fetch('/api/tags'),
      fetch('/api/characters')
    ])

    const [figuresData, brandsData, linesData, seriesData, tagsData, charactersData] = await Promise.all([
      figuresRes.json(),
      brandsRes.json(),
      linesRes.json(),
      seriesRes.json(),
      tagsRes.json(),
      charactersRes.json()
    ])

    setFigures(figuresData.figures)
    setBrands(brandsData.brands)
    setLines(linesData.lines)
    setSeriesList(seriesData.series)
    setTags(tagsData.tags)
    setCharacters(charactersData.characters)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/figures/${id}`)
      if (res.ok) {
        const data = await res.json()
        const f = data.figure

        setEditingId(id)
        setDimensionUnit('cm') // Reset to cm when editing
        setForm({
          name: f.name,
          description: f.description || '',
          sku: f.sku || '',
          heightCm: f.heightCm ? f.heightCm.toString() : '',
          widthCm: f.widthCm ? f.widthCm.toString() : '',
          depthCm: f.depthCm ? f.depthCm.toString() : '',
          scale: f.scale || '',
          material: f.material || '',
          maker: f.maker || '',
          priceMXN: f.priceMXN ? f.priceMXN.toString() : '',
          priceUSD: f.priceUSD ? f.priceUSD.toString() : '',
          priceYEN: f.priceYEN ? f.priceYEN.toString() : '',
          originalPriceCurrency: f.originalPriceCurrency || 'YEN',
          releaseDate: f.releaseDate || '',
          isReleased: f.isReleased,
          isNSFW: f.isNSFW,
          brandId: f.brand.id,
          lineId: f.line.id,
          characterId: f.character?.id || '',
          images: f.images.map((img: any) => img.url).join('\n'),
          tagIds: f.tags.map((t: any) => t.tag.id),
          seriesIds: f.series.map((s: any) => s.series.id)
        })
        setError('')
      }
    } catch (e) {
      console.error("Failed to fetch figure details", e)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setDimensionUnit('cm')
    setForm({
        name: '',
        description: '',
        sku: '',
        heightCm: '',
        widthCm: '',
        depthCm: '',
        scale: '',
        material: '',
        maker: '',
        priceMXN: '',
        priceUSD: '',
        priceYEN: '',
        originalPriceCurrency: 'YEN',
        releaseDate: '',
        isReleased: false,
        isNSFW: false,
        brandId: '',
        lineId: '',
        characterId: '',
        images: '',
        tagIds: [],
        seriesIds: []
    })
    setError('')
  }

  const filteredLines = lines.filter(l => l.brandId === form.brandId)
  const filteredFigures = figures.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Convert dimension from input unit to cm for storage
  const toCm = (value: string): number | null => {
    if (!value) return null
    const num = parseFloat(value)
    if (isNaN(num)) return null
    return dimensionUnit === 'in' ? inchesToCm(num) : num
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const images = form.images
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0)

      const url = editingId ? `/api/figures/${editingId}` : '/api/figures'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          sku: form.sku || null,
          heightCm: toCm(form.heightCm),
          widthCm: toCm(form.widthCm),
          depthCm: toCm(form.depthCm),
          scale: form.scale || null,
          material: form.material || null,
          maker: form.maker || null,
          priceMXN: form.priceMXN ? parseFloat(form.priceMXN) : null,
          priceUSD: form.priceUSD ? parseFloat(form.priceUSD) : null,
          priceYEN: form.priceYEN ? parseFloat(form.priceYEN) : null,
          originalPriceCurrency: form.originalPriceCurrency || null,
          releaseDate: form.releaseDate || null,
          isReleased: form.isReleased,
          isNSFW: form.isNSFW,
          brandId: form.brandId,
          lineId: form.lineId,
          characterId: form.characterId || null,
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

      handleCancelEdit()
      fetchData()
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta figura?')) return
    setFigures(figures.filter(f => f.id !== id))
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

  // Create new character inline
  const handleCreateCharacter = async () => {
    if (!newCharacterName.trim()) return
    setSavingCharacter(true)
    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCharacterName,
          seriesId: newCharacterSeriesId || null
        })
      })
      if (res.ok) {
        const data = await res.json()
        setCharacters([...characters, data.character])
        setForm(f => ({ ...f, characterId: data.character.id }))
        setShowNewCharacterModal(false)
        setNewCharacterName('')
        setNewCharacterSeriesId('')
      }
    } catch (e) {
      console.error('Error creating character', e)
    } finally {
      setSavingCharacter(false)
    }
  }

  // Toggle between released/pending
  const handleToggleReleased = async (id: string, newValue: boolean) => {
    try {
      const res = await fetch(`/api/figures/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isReleased: newValue })
      })

      if (res.ok) {
        setFigures(figures.map(f =>
          f.id === id ? { ...f, isReleased: newValue } : f
        ))
      }
    } catch (e) {
      console.error("Error al cambiar estado de lanzamiento", e)
    }
  }

  // View mode: 'catalog' or 'pending'
  const [viewMode, setViewMode] = useState<'catalog' | 'pending'>('catalog')

  // Track figures that were originally pending when entering the pending view
  // This allows them to stay visible even after marking as released (for undo purposes)
  const [pendingViewSnapshot, setPendingViewSnapshot] = useState<string[]>([])

  // When switching to pending view, capture current pending figure IDs
  const handleViewModeChange = (mode: 'catalog' | 'pending') => {
    if (mode === 'pending') {
      // Snapshot: IDs of figures that are currently not released
      const currentPendingIds = figures.filter(f => !f.isReleased).map(f => f.id)
      setPendingViewSnapshot(currentPendingIds)
    }
    setViewMode(mode)
  }

  // Figuras to show in pending view: those in snapshot, sorted by release date ASC
  const pendingViewFigures = figures
    .filter(f => pendingViewSnapshot.includes(f.id))
    .sort((a, b) => {
      if (!a.releaseDate && !b.releaseDate) return 0
      if (!a.releaseDate) return 1
      if (!b.releaseDate) return -1
      return a.releaseDate.localeCompare(b.releaseDate)
    })

  // Count of truly pending figures (for badge)
  const truePendingCount = figures.filter(f => !f.isReleased).length

  return (
    <div className="flex-1 bg-background pb-20 relative overflow-hidden">
       {/* Background Elements */}
       <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
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
                    <h1 className="text-2xl md:text-3xl font-title font-black text-white">Figuras</h1>
                    <p className="text-gray-400 text-xs md:text-sm">Catálogo completo</p>
                </div>
            </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-8">

            {/* Left Column: Create Form (Takes more space here due to fields) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="xl:col-span-5 h-fit sticky top-8"
            >
                <div className="bg-uiBase/40 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-primary/20 rounded-lg text-primary">
                                {editingId ? <ImageIcon className="w-4 h-4 md:w-5 md:h-5" /> : <Plus className="w-4 h-4 md:w-5 md:h-5" />}
                            </div>
                            <h2 className="text-base md:text-lg font-bold text-white">{editingId ? 'Editar Figura' : 'Nueva Figura'}</h2>
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

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-2 md:p-3 rounded-xl text-xs md:text-sm flex items-center gap-2">
                                <X size={16} /> {error}
                            </div>
                        )}

                        {/* Basic Info */}
                        <div className="space-y-3 md:space-y-4">
                            <h3 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2">Información Básica</h3>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Nombre *</label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2 text-sm md:text-base text-white focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Marca *</label>
                                    <div className="relative">
                                        <select
                                            value={form.brandId}
                                            onChange={(e) => setForm({ ...form, brandId: e.target.value, lineId: '' })}
                                            className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2 text-sm md:text-base text-white focus:border-primary transition-all"
                                            required
                                        >
                                            <option value="">Selecciona</option>
                                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Línea *</label>
                                    <div className="relative">
                                        <select
                                            value={form.lineId}
                                            onChange={(e) => setForm({ ...form, lineId: e.target.value })}
                                            className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2 text-sm md:text-base text-white focus:border-primary transition-all disabled:opacity-50"
                                            required
                                            disabled={!form.brandId}
                                        >
                                            <option value="">Selecciona</option>
                                            {filteredLines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block flex items-center gap-2">
                                        <User size={12} /> Personaje (opcional)
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <select
                                                value={form.characterId}
                                                onChange={(e) => setForm({ ...form, characterId: e.target.value })}
                                                className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2 text-sm md:text-base text-white focus:border-primary transition-all"
                                            >
                                                <option value="">Sin personaje</option>
                                                {characters.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}{c.series ? ` (${c.series.name})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowNewCharacterModal(true)}
                                            className="px-3 py-2 bg-cyan-600/20 border border-cyan-500/30 rounded-xl text-cyan-400 hover:bg-cyan-600/30 transition-colors"
                                            title="Crear nuevo personaje"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Prices & Dates */}
                        <div className="space-y-3 md:space-y-4">
                            <h3 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2"><DollarSign size={14}/> Precios y Fechas</h3>
                            <p className="text-[10px] md:text-xs text-gray-400">Selecciona el precio original (base) de la figura:</p>

                            <div className="grid grid-cols-3 gap-2 md:gap-3">
                                <div className="flex flex-col gap-1.5 md:gap-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">MXN</label>
                                        <input
                                            type="radio"
                                            name="originalCurrency"
                                            checked={form.originalPriceCurrency === 'MXN'}
                                            onChange={() => setForm({...form, originalPriceCurrency: 'MXN'})}
                                            className="accent-primary w-3 h-3"
                                        />
                                    </div>
                                    <input type="number" placeholder="0.00" value={form.priceMXN} onChange={e => setForm({...form, priceMXN: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-2 md:px-3 py-2 text-white text-xs md:text-sm w-full"/>
                                </div>
                                <div className="flex flex-col gap-1.5 md:gap-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">USD</label>
                                        <input
                                            type="radio"
                                            name="originalCurrency"
                                            checked={form.originalPriceCurrency === 'USD'}
                                            onChange={() => setForm({...form, originalPriceCurrency: 'USD'})}
                                            className="accent-primary w-3 h-3"
                                        />
                                    </div>
                                    <input type="number" placeholder="0.00" value={form.priceUSD} onChange={e => setForm({...form, priceUSD: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-2 md:px-3 py-2 text-white text-xs md:text-sm w-full"/>
                                </div>
                                <div className="flex flex-col gap-1.5 md:gap-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">YEN</label>
                                        <input
                                            type="radio"
                                            name="originalCurrency"
                                            checked={form.originalPriceCurrency === 'YEN'}
                                            onChange={() => setForm({...form, originalPriceCurrency: 'YEN'})}
                                            className="accent-primary w-3 h-3"
                                        />
                                    </div>
                                    <input type="number" placeholder="0" value={form.priceYEN} onChange={e => setForm({...form, priceYEN: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-2 md:px-3 py-2 text-white text-xs md:text-sm w-full"/>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 md:gap-3 pt-2">
                                <div>
                                    <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Lanzamiento (YYYY-MM)</label>
                                    <input type="text" placeholder="Ej. 2024-12" value={form.releaseDate} onChange={e => setForm({...form, releaseDate: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-2 md:px-3 py-2 text-white text-xs md:text-sm w-full"/>
                                </div>
                                <div className="flex flex-col justify-end">
                                    <label className="flex items-center gap-2 text-xs md:text-sm text-gray-300 cursor-pointer bg-black/20 rounded-xl px-2 md:px-3 py-2 border border-white/5 h-[38px]">
                                        <input type="checkbox" checked={form.isReleased} onChange={e => setForm({...form, isReleased: e.target.checked})} className="accent-primary w-4 h-4"/>
                                        Ya lanzada
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Specs */}
                        <div className="space-y-3 md:space-y-4">
                            <h3 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2"><Ruler size={14}/> Especificaciones</h3>

                            {/* Dimensions with unit toggle */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Dimensiones</label>
                                    <button
                                        type="button"
                                        onClick={() => setDimensionUnit(dimensionUnit === 'cm' ? 'in' : 'cm')}
                                        className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    >
                                        <ArrowLeftRight size={10} />
                                        {dimensionUnit === 'cm' ? 'Centímetros' : 'Pulgadas'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-[10px] text-gray-500 ml-1">Altura ({dimensionUnit})</label>
                                        <input type="number" step="0.01" placeholder="0.00" value={form.heightCm} onChange={e => setForm({...form, heightCm: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full"/>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 ml-1">Ancho ({dimensionUnit})</label>
                                        <input type="number" step="0.01" placeholder="0.00" value={form.widthCm} onChange={e => setForm({...form, widthCm: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full"/>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 ml-1">Profund. ({dimensionUnit})</label>
                                        <input type="number" step="0.01" placeholder="0.00" value={form.depthCm} onChange={e => setForm({...form, depthCm: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full"/>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Escala</label>
                                    <input placeholder="e.g. 1/12" value={form.scale} onChange={e => setForm({...form, scale: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full"/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Material</label>
                                    <input placeholder="PVC, ABS" value={form.material} onChange={e => setForm({...form, material: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full"/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">SKU / Código</label>
                                    <input placeholder="ABCD-1234" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full"/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Fabricante</label>
                                    <input placeholder="e.g. Tamashii Nations" value={form.maker} onChange={e => setForm({...form, maker: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full"/>
                                </div>
                            </div>
                        </div>

                        {/* Media */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2"><ImageIcon size={14}/> Imágenes</h3>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">URLs (Una por línea)</label>
                                <textarea 
                                    value={form.images}
                                    onChange={(e) => setForm({ ...form, images: e.target.value })}
                                    rows={3}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        {/* Taxonomy */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2"><Tag size={14}/> Taxonomía</h3>
                            
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Series</p>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1 border border-white/5 rounded-xl bg-black/20">
                                    {seriesList.map(s => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => toggleSeries(s.id)}
                                            className={`px-2 py-1 text-[10px] font-bold uppercase rounded border transition-colors ${
                                                form.seriesIds.includes(s.id)
                                                ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                                                : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30'
                                            }`}
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Tags</p>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1 border border-white/5 rounded-xl bg-black/20">
                                    {tags.map(t => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => toggleTag(t.id)}
                                            className={`px-2 py-1 text-[10px] font-bold uppercase rounded border transition-colors ${
                                                form.tagIds.includes(t.id)
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                                : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30'
                                            }`}
                                        >
                                            {t.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 md:py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group text-sm md:text-base"
                        >
                            {saving ? (
                                'Guardando...'
                            ) : (
                                <>
                                    <Save size={18} className="group-hover:scale-110 transition-transform" />
                                    {editingId ? 'Actualizar Figura' : 'Guardar Figura'}
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
                className="xl:col-span-7"
            >
                {/* View Mode Tabs */}
                <div className="flex items-center gap-2 mb-6">
                    <button
                        onClick={() => handleViewModeChange('catalog')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                            viewMode === 'catalog'
                                ? 'bg-primary/20 border border-primary/50 text-primary'
                                : 'bg-uiBase/30 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                    >
                        <Box size={16} />
                        Catálogo
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">{figures.length}</span>
                    </button>
                    <button
                        onClick={() => handleViewModeChange('pending')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                            viewMode === 'pending'
                                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                                : 'bg-uiBase/30 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                    >
                        <Clock size={16} />
                        Pendientes
                        {truePendingCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300">{truePendingCount}</span>
                        )}
                    </button>
                </div>

                {/* Catalog View */}
                {viewMode === 'catalog' && (
                    <>
                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar figuras por nombre o marca..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-uiBase/30 backdrop-blur-sm border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-white/30 transition-all shadow-lg"
                            />
                        </div>

                        {/* Results */}
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Cargando...</div>
                        ) : filteredFigures.length === 0 ? (
                            <div className="text-center py-12 bg-uiBase/20 rounded-3xl border border-white/5 border-dashed">
                                <p className="text-gray-500">No se encontraron figuras.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence mode='popLayout'>
                                    {filteredFigures.map(figure => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            key={figure.id}
                                            className={`group flex items-center gap-4 bg-uiBase/40 backdrop-blur-md border rounded-2xl p-4 transition-all ${editingId === figure.id ? 'border-primary/50 ring-1 ring-primary/50 bg-primary/5' : 'border-white/5 hover:bg-uiBase/60 hover:border-white/20'}`}
                                        >
                                            {/* Image Thumbnail */}
                                            <div className="w-16 h-16 rounded-xl bg-black/50 flex-shrink-0 overflow-hidden border border-white/10">
                                                {figure.images[0] ? (
                                                    <img src={figure.images[0].url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-700"><Box size={20}/></div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-grow min-w-0">
                                                <h3 className="font-bold text-white truncate">{figure.name}</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <span className="text-primary">{figure.brand.name}</span>
                                                    <span>•</span>
                                                    <span>{figure.line.name}</span>
                                                    {figure.releaseDate && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{figure.releaseDate}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(figure.id)}
                                                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <Link
                                                    href={`/catalog/${figure.id}`}
                                                    target="_blank"
                                                    className="p-2 rounded-lg bg-white/5 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                                >
                                                    <ExternalLink size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(figure.id)}
                                                    className="p-2 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/20 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </>
                )}

                {/* Pending Releases View */}
                {viewMode === 'pending' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 backdrop-blur-md border border-amber-500/20 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Figuras Pendientes de Lanzar</h3>
                                <p className="text-sm text-gray-400">
                                    {truePendingCount} pendiente{truePendingCount !== 1 ? 's' : ''} de {pendingViewFigures.length} • Ordenado por fecha
                                </p>
                            </div>
                        </div>

                        {pendingViewFigures.length === 0 ? (
                            <div className="text-center py-12 bg-black/20 rounded-xl border border-white/5">
                                <CheckCircle size={48} className="mx-auto text-emerald-500/50 mb-3" />
                                <p className="text-gray-400">No hay figuras pendientes de lanzar</p>
                                <p className="text-xs text-gray-500 mt-1">Todas las figuras han sido marcadas como lanzadas</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                <AnimatePresence mode='popLayout'>
                                    {pendingViewFigures.map(figure => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={figure.id}
                                            className={`relative flex items-center gap-4 bg-black/30 border rounded-xl p-4 group transition-all ${
                                                figure.isReleased
                                                    ? 'border-emerald-500/30 bg-emerald-500/5'
                                                    : 'border-white/5 hover:border-amber-500/30'
                                            }`}
                                        >

                                            {/* Thumbnail */}
                                            <div className="w-14 h-14 rounded-lg bg-black/50 flex-shrink-0 overflow-hidden border border-white/10">
                                                {figure.images[0] ? (
                                                    <img src={figure.images[0].url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-700"><Box size={18}/></div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-white truncate">{figure.name}</h4>
                                                    {figure.isReleased && (
                                                        <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <span className="text-amber-400">{figure.brand.name}</span>
                                                    <span>•</span>
                                                    <span>{figure.line.name}</span>
                                                </div>
                                                {figure.releaseDate && (
                                                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-400/80">
                                                        <Calendar size={12} />
                                                        <span>{figure.releaseDate}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Toggle Released Button */}
                                            <button
                                                onClick={() => handleToggleReleased(figure.id, !figure.isReleased)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                                    figure.isReleased
                                                        ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400'
                                                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400'
                                                }`}
                                                title={figure.isReleased ? 'Volver a pendiente' : 'Marcar como lanzada'}
                                            >
                                                {figure.isReleased ? (
                                                    <>
                                                        <Clock size={14} />
                                                        <span>Pendiente</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Rocket size={14} />
                                                        <span>Lanzada</span>
                                                    </>
                                                )}
                                            </button>

                                            {/* Edit Button */}
                                            <button
                                                onClick={() => handleEdit(figure.id)}
                                                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>

        </div>
      </div>

      {/* New Character Modal */}
      <AnimatePresence>
        {showNewCharacterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowNewCharacterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                    <User size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Nuevo Personaje</h2>
                </div>
                <button onClick={() => setShowNewCharacterModal(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Nombre *</label>
                  <input
                    value={newCharacterName}
                    onChange={e => setNewCharacterName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 transition-all"
                    placeholder="Ej. Goku, Naruto..."
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Serie (opcional)</label>
                  <div className="relative">
                    <select
                      value={newCharacterSeriesId}
                      onChange={e => setNewCharacterSeriesId(e.target.value)}
                      className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 transition-all"
                    >
                      <option value="" className="bg-gray-900">Sin serie</option>
                      {seriesList.map(s => (
                        <option key={s.id} value={s.id} className="bg-gray-900">{s.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewCharacterModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCharacter}
                    disabled={!newCharacterName.trim() || savingCharacter}
                    className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingCharacter ? 'Creando...' : 'Crear'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
