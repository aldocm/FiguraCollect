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
  Clock,
  ChevronDown,
  DollarSign,
  Ruler,
  ImageIcon,
  X,
  AlertTriangle
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

type TabType = 'figures' | 'brands' | 'lines' | 'series' | 'characters'

// Predefined scales for figures
const SCALE_OPTIONS = ['1/1', '1/2', '1/3', '1/4', '1/5', '1/6', '1/7', '1/8', '1/9', '1/10', '1/11', '1/12']

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

const inputClass = "w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-all placeholder:text-gray-600"
const selectClass = "w-full appearance-none bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-all [&>option]:bg-[#0a0a0a] [&>option]:text-white"
const labelClass = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"

export default function ContributeClient() {
  const { t } = useLanguage()
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
    description: '',
    brandId: '',
    lineId: '',
    releaseYear: '',
    releaseMonth: '',
    releaseDay: '',
    material: '',
    scale: '',
    heightCm: '',
    widthCm: '',
    depthCm: '',
    originalPriceCurrency: 'YEN' as 'MXN' | 'USD' | 'YEN',
    priceMXN: '',
    priceUSD: '',
    priceYEN: '',
    isNSFW: false,
    isReleased: false,
    images: [''] // Array de URLs de imágenes
  })

  // Estado para rastrear imágenes con error de carga
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({})

  const [brandForm, setBrandForm] = useState({ name: '', country: '' })
  const [lineForm, setLineForm] = useState({ name: '', brandId: '' })
  const [seriesForm, setSeriesForm] = useState({ name: '' })
  const [characterForm, setCharacterForm] = useState({ name: '', seriesId: '' })

  // Scale selector state
  const [showCustomScale, setShowCustomScale] = useState(false)
  const [customScaleValue, setCustomScaleValue] = useState('')

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
    setFigureForm({
      name: '',
      description: '',
      brandId: '',
      lineId: '',
      releaseYear: '',
      releaseMonth: '',
      releaseDay: '',
      material: '',
      scale: '',
      heightCm: '',
      widthCm: '',
      depthCm: '',
      originalPriceCurrency: 'YEN',
      priceMXN: '',
      priceUSD: '',
      priceYEN: '',
      isNSFW: false,
      isReleased: false,
      images: ['']
    })
    setImageErrors({})
    setImageLoading({})
    setBrandForm({ name: '', country: '' })
    setLineForm({ name: '', brandId: '' })
    setSeriesForm({ name: '' })
    setCharacterForm({ name: '', seriesId: '' })
  }

  // Funciones para manejar imágenes
  const handleImageChange = (index: number, value: string) => {
    const newImages = [...figureForm.images]
    newImages[index] = value
    setFigureForm(f => ({ ...f, images: newImages }))
    // Reset error state cuando el usuario cambia la URL
    setImageErrors(prev => ({ ...prev, [index]: false }))
    setImageLoading(prev => ({ ...prev, [index]: true }))
  }

  const addImageField = () => {
    setFigureForm(f => ({ ...f, images: [...f.images, ''] }))
  }

  const removeImageField = (index: number) => {
    if (figureForm.images.length > 1) {
      const newImages = figureForm.images.filter((_, i) => i !== index)
      setFigureForm(f => ({ ...f, images: newImages }))
      // Limpiar estados de error/loading
      const newErrors = { ...imageErrors }
      const newLoading = { ...imageLoading }
      delete newErrors[index]
      delete newLoading[index]
      setImageErrors(newErrors)
      setImageLoading(newLoading)
    }
  }

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }))
    setImageLoading(prev => ({ ...prev, [index]: false }))
  }

  const handleImageLoad = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: false }))
    setImageLoading(prev => ({ ...prev, [index]: false }))
  }

  const isValidImageUrl = (url: string) => {
    if (!url.trim()) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
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
          // Filtrar URLs vacías y solo enviar las válidas
          const validImages = figureForm.images.filter(url => url.trim() !== '')
          body = {
            name: figureForm.name,
            description: figureForm.description || null,
            brandId: figureForm.brandId,
            lineId: figureForm.lineId,
            releaseYear: figureForm.releaseYear ? parseInt(figureForm.releaseYear) : null,
            releaseMonth: figureForm.releaseMonth ? parseInt(figureForm.releaseMonth) : null,
            releaseDay: figureForm.releaseDay ? parseInt(figureForm.releaseDay) : null,
            material: figureForm.material || null,
            scale: figureForm.scale || null,
            heightCm: figureForm.heightCm ? parseFloat(figureForm.heightCm) : null,
            widthCm: figureForm.widthCm ? parseFloat(figureForm.widthCm) : null,
            depthCm: figureForm.depthCm ? parseFloat(figureForm.depthCm) : null,
            originalPriceCurrency: figureForm.originalPriceCurrency,
            priceMXN: figureForm.priceMXN ? parseFloat(figureForm.priceMXN) : null,
            priceUSD: figureForm.priceUSD ? parseFloat(figureForm.priceUSD) : null,
            priceYEN: figureForm.priceYEN ? parseInt(figureForm.priceYEN) : null,
            isNSFW: figureForm.isNSFW,
            isReleased: figureForm.isReleased,
            images: validImages.length > 0 ? validImages : undefined
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
        setMessage({ type: 'success', text: t.contribute.messages.success })
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
        setMessage({ type: 'error', text: data.error || t.contribute.messages.error })
      }
    } catch {
      setMessage({ type: 'error', text: t.contribute.messages.connectionError })
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'figures' as TabType, label: t.contribute.tabs.figure, icon: Package },
    { id: 'brands' as TabType, label: t.contribute.tabs.brand, icon: Building2 },
    { id: 'lines' as TabType, label: t.contribute.tabs.line, icon: Layers },
    { id: 'series' as TabType, label: t.contribute.tabs.series, icon: Film },
    { id: 'characters' as TabType, label: t.contribute.tabs.character, icon: Users }
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear + 5 - i)
  const months = [
    { value: '1', label: t.contribute.months.january },
    { value: '2', label: t.contribute.months.february },
    { value: '3', label: t.contribute.months.march },
    { value: '4', label: t.contribute.months.april },
    { value: '5', label: t.contribute.months.may },
    { value: '6', label: t.contribute.months.june },
    { value: '7', label: t.contribute.months.july },
    { value: '8', label: t.contribute.months.august },
    { value: '9', label: t.contribute.months.september },
    { value: '10', label: t.contribute.months.october },
    { value: '11', label: t.contribute.months.november },
    { value: '12', label: t.contribute.months.december }
  ]

  return (
    <div className="flex-1 bg-background pb-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-title font-black text-white">{t.contribute.title}</h1>
            <p className="text-gray-400 text-sm">{t.contribute.subtitle}</p>
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
            <p className="text-amber-200 text-sm font-medium">{t.contribute.pendingApproval}</p>
            <p className="text-amber-200/70 text-xs mt-1">
              {t.contribute.pendingDescription}
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
        {loading ? (
          <div className="text-center py-12 text-gray-500">{t.contribute.loading}</div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Figure Form */}
            {activeTab === 'figures' && (
              <>
                {/* Basic Info Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2">
                    {t.contribute.sections.basicInfo}
                  </h3>

                  <div>
                    <label className={labelClass}>{t.contribute.labels.figureName} *</label>
                    <input
                      type="text"
                      value={figureForm.name}
                      onChange={e => setFigureForm(f => ({ ...f, name: e.target.value }))}
                      className={inputClass}
                      placeholder={t.contribute.placeholders.figureName}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>{t.contribute.labels.description}</label>
                    <textarea
                      value={figureForm.description}
                      onChange={e => setFigureForm(f => ({ ...f, description: e.target.value }))}
                      className={`${inputClass} resize-none`}
                      placeholder={t.contribute.placeholders.description}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t.contribute.labels.brand} *</label>
                      <div className="relative">
                        <select
                          value={figureForm.brandId}
                          onChange={e => setFigureForm(f => ({ ...f, brandId: e.target.value, lineId: '' }))}
                          className={selectClass}
                          required
                        >
                          <option value="">{t.contribute.placeholders.select}</option>
                          {[...brands].sort((a, b) => a.name.localeCompare(b.name)).map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>{t.contribute.labels.line} *</label>
                      <div className="relative">
                        <select
                          value={figureForm.lineId}
                          onChange={e => setFigureForm(f => ({ ...f, lineId: e.target.value }))}
                          className={`${selectClass} disabled:opacity-50`}
                          required
                          disabled={!figureForm.brandId}
                        >
                          <option value="">{t.contribute.placeholders.select}</option>
                          {[...filteredLines].sort((a, b) => a.name.localeCompare(b.name)).map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>{t.contribute.labels.material}</label>
                    <input
                      type="text"
                      value={figureForm.material}
                      onChange={e => setFigureForm(f => ({ ...f, material: e.target.value }))}
                      className={inputClass}
                      placeholder={t.contribute.placeholders.material}
                    />
                  </div>
                </div>

                {/* Specs Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
                    <Ruler size={14} /> {t.contribute.sections.specs}
                  </h3>

                  <div>
                    <label className={labelClass}>{t.contribute.labels.scale}</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <select
                          value={showCustomScale ? 'custom' : figureForm.scale}
                          onChange={e => {
                            const val = e.target.value
                            if (val === 'custom') {
                              setShowCustomScale(true)
                              setCustomScaleValue('')
                              setFigureForm(f => ({ ...f, scale: '' }))
                            } else {
                              setShowCustomScale(false)
                              setCustomScaleValue('')
                              setFigureForm(f => ({ ...f, scale: val }))
                            }
                          }}
                          className={`${inputClass} appearance-none pr-10`}
                        >
                          <option value="">Sin escala</option>
                          {SCALE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          <option value="custom">Otra...</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                      {showCustomScale && (
                        <input
                          type="text"
                          value={customScaleValue}
                          onChange={e => {
                            setCustomScaleValue(e.target.value)
                            setFigureForm(f => ({ ...f, scale: e.target.value }))
                          }}
                          placeholder="Ej: 1/144"
                          className={`${inputClass} w-24`}
                          autoFocus
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">{t.contribute.labels.dimensions}</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-gray-600 mb-1 block">{t.contribute.labels.height}</label>
                        <input
                          type="number"
                          step="0.01"
                          value={figureForm.heightCm}
                          onChange={e => setFigureForm(f => ({ ...f, heightCm: e.target.value }))}
                          className={inputClass}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-600 mb-1 block">{t.contribute.labels.width}</label>
                        <input
                          type="number"
                          step="0.01"
                          value={figureForm.widthCm}
                          onChange={e => setFigureForm(f => ({ ...f, widthCm: e.target.value }))}
                          className={inputClass}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-600 mb-1 block">{t.contribute.labels.depth}</label>
                        <input
                          type="number"
                          step="0.01"
                          value={figureForm.depthCm}
                          onChange={e => setFigureForm(f => ({ ...f, depthCm: e.target.value }))}
                          className={inputClass}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
                    <DollarSign size={14} /> {t.contribute.sections.price}
                  </h3>
                  <p className="text-xs text-gray-400">{t.contribute.labels.selectCurrency}</p>

                  <div className="grid grid-cols-3 gap-3">
                    {(['MXN', 'USD', 'YEN'] as const).map((currency) => (
                      <div key={currency} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-400 uppercase">{currency}</label>
                          <input
                            type="radio"
                            name="originalCurrency"
                            checked={figureForm.originalPriceCurrency === currency}
                            onChange={() => setFigureForm(f => ({ ...f, originalPriceCurrency: currency }))}
                            className="accent-primary w-3 h-3"
                          />
                        </div>
                        <input
                          type="number"
                          placeholder={currency === 'YEN' ? '0' : '0.00'}
                          value={figureForm[`price${currency}` as keyof typeof figureForm] as string}
                          onChange={e => setFigureForm(f => ({ ...f, [`price${currency}`]: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Release Date Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2">
                    {t.contribute.sections.releaseDate}
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">{t.contribute.labels.year}</label>
                      <div className="relative">
                        <select
                          value={figureForm.releaseYear}
                          onChange={e => setFigureForm(f => ({ ...f, releaseYear: e.target.value }))}
                          className={selectClass}
                        >
                          <option value="">-</option>
                          {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">{t.contribute.labels.month}</label>
                      <div className="relative">
                        <select
                          value={figureForm.releaseMonth}
                          onChange={e => setFigureForm(f => ({ ...f, releaseMonth: e.target.value }))}
                          className={selectClass}
                        >
                          <option value="">-</option>
                          {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">{t.contribute.labels.day}</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="-"
                        value={figureForm.releaseDay}
                        onChange={e => setFigureForm(f => ({ ...f, releaseDay: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
                    <ImageIcon size={14} /> {t.contribute.sections.images}
                  </h3>

                  <div className="space-y-3">
                    {figureForm.images.map((imageUrl, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={e => handleImageChange(index, e.target.value)}
                            className={`${inputClass} flex-1`}
                            placeholder={t.contribute.placeholders.imageUrl}
                          />
                          {figureForm.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeImageField(index)}
                              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                              title={t.contribute.labels.removeImage}
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>

                        {/* Preview de la imagen */}
                        {isValidImageUrl(imageUrl) && (
                          <div className="relative">
                            <div className={`relative w-full h-32 rounded-xl overflow-hidden bg-black/40 border ${
                              imageErrors[index] ? 'border-amber-500/30' : 'border-white/10'
                            }`}>
                              {imageLoading[index] && !imageErrors[index] && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-5 h-5 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
                                </div>
                              )}
                              {imageErrors[index] ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-400 gap-2">
                                  <AlertTriangle size={24} />
                                  <span className="text-xs text-center px-4">
                                    No se pudo cargar la imagen. Verifica la URL.
                                  </span>
                                </div>
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={imageUrl}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-contain"
                                  onError={() => handleImageError(index)}
                                  onLoad={() => handleImageLoad(index)}
                                />
                              )}
                            </div>
                            <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                              {t.contribute.labels.imagePreview} #{index + 1}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Botón para agregar más imágenes */}
                    <button
                      type="button"
                      onClick={addImageField}
                      className="w-full py-3 rounded-xl border border-dashed border-white/20 text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Plus size={16} />
                      {t.contribute.labels.addImage}
                    </button>
                  </div>
                </div>

                {/* Options Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2">
                    {t.contribute.sections.options}
                  </h3>

                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer bg-[#0d0d0d] rounded-xl px-4 py-3 border border-white/10 hover:border-white/20 transition-colors">
                      <input
                        type="checkbox"
                        checked={figureForm.isReleased}
                        onChange={e => setFigureForm(f => ({ ...f, isReleased: e.target.checked }))}
                        className="accent-primary w-4 h-4"
                      />
                      {t.contribute.labels.alreadyReleased}
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer bg-[#0d0d0d] rounded-xl px-4 py-3 border border-white/10 hover:border-white/20 transition-colors">
                      <input
                        type="checkbox"
                        checked={figureForm.isNSFW}
                        onChange={e => setFigureForm(f => ({ ...f, isNSFW: e.target.checked }))}
                        className="accent-red-500 w-4 h-4"
                      />
                      {t.contribute.labels.nsfw}
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Brand Form */}
            {activeTab === 'brands' && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t.contribute.labels.brandName} *</label>
                  <input
                    type="text"
                    value={brandForm.name}
                    onChange={e => setBrandForm(f => ({ ...f, name: e.target.value }))}
                    className={inputClass}
                    placeholder={t.contribute.placeholders.brandName}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>{t.contribute.labels.country}</label>
                  <input
                    type="text"
                    value={brandForm.country}
                    onChange={e => setBrandForm(f => ({ ...f, country: e.target.value }))}
                    className={inputClass}
                    placeholder={t.contribute.placeholders.country}
                  />
                </div>
              </div>
            )}

            {/* Line Form */}
            {activeTab === 'lines' && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t.contribute.labels.brand} *</label>
                  <div className="relative">
                    <select
                      value={lineForm.brandId}
                      onChange={e => setLineForm(f => ({ ...f, brandId: e.target.value }))}
                      className={selectClass}
                      required
                    >
                      <option value="">{t.contribute.placeholders.selectBrand}</option>
                      {[...brands].sort((a, b) => a.name.localeCompare(b.name)).map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t.contribute.labels.lineName} *</label>
                  <input
                    type="text"
                    value={lineForm.name}
                    onChange={e => setLineForm(f => ({ ...f, name: e.target.value }))}
                    className={inputClass}
                    placeholder={t.contribute.placeholders.lineName}
                    required
                  />
                </div>
              </div>
            )}

            {/* Series Form */}
            {activeTab === 'series' && (
              <div>
                <label className={labelClass}>{t.contribute.labels.seriesName} *</label>
                <input
                  type="text"
                  value={seriesForm.name}
                  onChange={e => setSeriesForm(f => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                  placeholder={t.contribute.placeholders.seriesName}
                  required
                />
              </div>
            )}

            {/* Character Form */}
            {activeTab === 'characters' && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t.contribute.labels.seriesOptional}</label>
                  <div className="relative">
                    <select
                      value={characterForm.seriesId}
                      onChange={e => setCharacterForm(f => ({ ...f, seriesId: e.target.value }))}
                      className={selectClass}
                    >
                      <option value="">{t.contribute.labels.noSeries}</option>
                      {[...seriesList].sort((a, b) => a.name.localeCompare(b.name)).map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t.contribute.labels.characterName} *</label>
                  <input
                    type="text"
                    value={characterForm.name}
                    onChange={e => setCharacterForm(f => ({ ...f, name: e.target.value }))}
                    className={inputClass}
                    placeholder={t.contribute.placeholders.characterName}
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus size={18} />
                  {t.contribute.submit}
                </>
              )}
            </button>
          </motion.form>
        )}

        {/* Help Text */}
        <p className="text-center text-gray-500 text-xs mt-6">
          {t.contribute.helpText}
        </p>
      </div>
    </div>
  )
}
