'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  Building2,
  Layers,
  Film,
  Users,
  Plus,
  Check,
  AlertCircle,
  Clock
} from 'lucide-react'

type TabType = 'figures' | 'brands' | 'lines' | 'series' | 'characters'

interface Brand {
  id: string
  name: string
}

interface Line {
  id: string
  name: string
  brandId: string
}

interface Series {
  id: string
  name: string
}

export default function ContributeClient() {
  const [activeTab, setActiveTab] = useState<TabType>('figures')
  const [brands, setBrands] = useState<Brand[]>([])
  const [lines, setLines] = useState<Line[]>([])
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form states
  const [figureForm, setFigureForm] = useState({
    name: '',
    brandId: '',
    lineId: '',
    releaseYear: '',
    releaseMonth: ''
  })

  const [brandForm, setBrandForm] = useState({ name: '', country: '' })
  const [lineForm, setLineForm] = useState({ name: '', brandId: '' })
  const [seriesForm, setSeriesForm] = useState({ name: '' })
  const [characterForm, setCharacterForm] = useState({ name: '', seriesId: '' })

  useEffect(() => {
    async function fetchData() {
      try {
        const [brandsRes, linesRes, seriesRes] = await Promise.all([
          fetch('/api/brands'),
          fetch('/api/lines'),
          fetch('/api/series')
        ])

        if (brandsRes.ok) {
          const data = await brandsRes.json()
          setBrands(data.brands || [])
        }
        if (linesRes.ok) {
          const data = await linesRes.json()
          setLines(data.lines || [])
        }
        if (seriesRes.ok) {
          const data = await seriesRes.json()
          setSeriesList(data.series || [])
        }
      } catch (e) {
        console.error('Error fetching data', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredLines = lines.filter(l => !figureForm.brandId || l.brandId === figureForm.brandId)

  const resetForms = () => {
    setFigureForm({ name: '', brandId: '', lineId: '', releaseYear: '', releaseMonth: '' })
    setBrandForm({ name: '', country: '' })
    setLineForm({ name: '', brandId: '' })
    setSeriesForm({ name: '' })
    setCharacterForm({ name: '', seriesId: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      let endpoint = ''
      let body = {}

      switch (activeTab) {
        case 'figures':
          endpoint = '/api/figures'
          body = {
            name: figureForm.name,
            brandId: figureForm.brandId,
            lineId: figureForm.lineId,
            releaseYear: figureForm.releaseYear ? parseInt(figureForm.releaseYear) : null,
            releaseMonth: figureForm.releaseMonth ? parseInt(figureForm.releaseMonth) : null
          }
          break
        case 'brands':
          endpoint = '/api/brands'
          body = brandForm
          break
        case 'lines':
          endpoint = '/api/lines'
          body = lineForm
          break
        case 'series':
          endpoint = '/api/series'
          body = seriesForm
          break
        case 'characters':
          endpoint = '/api/characters'
          body = characterForm
          break
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Enviado correctamente. Pendiente de aprobacion.' })
        resetForms()

        // Refresh data if needed
        if (activeTab === 'brands') {
          const brandsRes = await fetch('/api/brands')
          if (brandsRes.ok) {
            const data = await brandsRes.json()
            setBrands(data.brands || [])
          }
        } else if (activeTab === 'lines') {
          const linesRes = await fetch('/api/lines')
          if (linesRes.ok) {
            const data = await linesRes.json()
            setLines(data.lines || [])
          }
        } else if (activeTab === 'series') {
          const seriesRes = await fetch('/api/series')
          if (seriesRes.ok) {
            const data = await seriesRes.json()
            setSeriesList(data.series || [])
          }
        }
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Error al enviar' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexion' })
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'figures' as TabType, label: 'Figura', icon: Package },
    { id: 'brands' as TabType, label: 'Marca', icon: Building2 },
    { id: 'lines' as TabType, label: 'Linea', icon: Layers },
    { id: 'series' as TabType, label: 'Serie', icon: Film },
    { id: 'characters' as TabType, label: 'Personaje', icon: Users }
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear + 5 - i)
  const months = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0a0a1a] to-black p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-title font-black text-white">Contribuir</h1>
            <p className="text-gray-400 text-sm">Agrega contenido al catalogo</p>
          </div>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-start gap-3"
        >
          <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-200 text-sm font-medium">Pendiente de aprobacion</p>
            <p className="text-amber-200/70 text-xs mt-1">
              Todo el contenido que agregues sera revisado por un administrador antes de publicarse.
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setMessage(null)
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
        >
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Figure Form */}
              {activeTab === 'figures' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre de la figura *
                    </label>
                    <input
                      type="text"
                      value={figureForm.name}
                      onChange={e => setFigureForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                      placeholder="Ej: Miku Hatsune 1/7 Scale"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Marca *</label>
                      <select
                        value={figureForm.brandId}
                        onChange={e => setFigureForm(f => ({ ...f, brandId: e.target.value, lineId: '' }))}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                        required
                      >
                        <option value="">Seleccionar...</option>
                        {brands.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Linea *</label>
                      <select
                        value={figureForm.lineId}
                        onChange={e => setFigureForm(f => ({ ...f, lineId: e.target.value }))}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                        required
                        disabled={!figureForm.brandId}
                      >
                        <option value="">Seleccionar...</option>
                        {filteredLines.map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Año de lanzamiento</label>
                      <select
                        value={figureForm.releaseYear}
                        onChange={e => setFigureForm(f => ({ ...f, releaseYear: e.target.value }))}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                      >
                        <option value="">Sin especificar</option>
                        {years.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Mes</label>
                      <select
                        value={figureForm.releaseMonth}
                        onChange={e => setFigureForm(f => ({ ...f, releaseMonth: e.target.value }))}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                        disabled={!figureForm.releaseYear}
                      >
                        <option value="">Sin especificar</option>
                        {months.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Brand Form */}
              {activeTab === 'brands' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre de la marca *
                    </label>
                    <input
                      type="text"
                      value={brandForm.name}
                      onChange={e => setBrandForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                      placeholder="Ej: Good Smile Company"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Pais</label>
                    <input
                      type="text"
                      value={brandForm.country}
                      onChange={e => setBrandForm(f => ({ ...f, country: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                      placeholder="Ej: Japon"
                    />
                  </div>
                </>
              )}

              {/* Line Form */}
              {activeTab === 'lines' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Marca *</label>
                    <select
                      value={lineForm.brandId}
                      onChange={e => setLineForm(f => ({ ...f, brandId: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                      required
                    >
                      <option value="">Seleccionar marca...</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre de la linea *
                    </label>
                    <input
                      type="text"
                      value={lineForm.name}
                      onChange={e => setLineForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                      placeholder="Ej: Nendoroid"
                      required
                    />
                  </div>
                </>
              )}

              {/* Series Form */}
              {activeTab === 'series' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre de la serie *
                  </label>
                  <input
                    type="text"
                    value={seriesForm.name}
                    onChange={e => setSeriesForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                    placeholder="Ej: Demon Slayer"
                    required
                  />
                </div>
              )}

              {/* Character Form */}
              {activeTab === 'characters' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Serie</label>
                    <select
                      value={characterForm.seriesId}
                      onChange={e => setCharacterForm(f => ({ ...f, seriesId: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                    >
                      <option value="">Sin serie (personaje original)</option>
                      {seriesList.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre del personaje *
                    </label>
                    <input
                      type="text"
                      value={characterForm.name}
                      onChange={e => setCharacterForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                      placeholder="Ej: Tanjiro Kamado"
                      required
                    />
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus size={18} />
                    Enviar para aprobacion
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>

        {/* Help Text */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Si no encuentras la marca o linea que necesitas, crealas primero en las pestañas correspondientes.
        </p>
      </div>
    </div>
  )
}
