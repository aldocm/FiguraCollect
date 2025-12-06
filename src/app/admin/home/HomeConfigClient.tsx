'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, GripVertical, Eye, EyeOff, ArrowLeft, Loader2, 
  Plus, Trash2, Edit2, X, Sparkles, List as ListIcon, 
  Filter, Tag, DollarSign, Search, Calendar
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// --- TYPES ---
type HomeSection = {
  id: string
  title: string
  type: 'QUERY' | 'LIST' | 'PRESET'
  config: string
  viewAllUrl: string | null
  isVisible: boolean
  order: number
}

export default function HomeConfigClient() {
  const router = useRouter()
  const [sections, setSections] = useState<HomeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null)

  // Form State
  const [enablePriceFilter, setEnablePriceFilter] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'QUERY',
    // Query Filters
    brandId: '',
    lineId: '',
    seriesId: '',
    characterId: '',
    minPrice: '',
    maxPrice: '',
    currency: 'MXN',
    isReleased: 'all', // all, true, false
    search: '',
    // List Selection
    listId: '',
  })

  // Dropdown Data
  const [brands, setBrands] = useState<{id: string, name: string}[]>([])
  const [lines, setLines] = useState<{id: string, name: string}[]>([])
  const [series, setSeries] = useState<{id: string, name: string}[]>([])
  const [characters, setCharacters] = useState<{id: string, name: string}[]>([])
  const [lists, setLists] = useState<{id: string, name: string}[]>([])

  useEffect(() => {
    fetchSections()
    fetchDropdownData()
  }, [])

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/admin/home-sections')
      if (res.ok) {
        const data = await res.json()
        setSections(data)
      }
    } catch (error) {
      console.error('Error fetching sections', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDropdownData = async () => {
    try {
        const [bRes, lRes, sRes, cRes, listRes] = await Promise.all([
            fetch('/api/brands').then(r => r.json()),
            fetch('/api/lines').then(r => r.json()),
            fetch('/api/series').then(r => r.json()),
            fetch('/api/characters').then(r => r.json()),
            fetch('/api/lists').then(r => r.json())
        ])
        setBrands(bRes.brands || [])
        setLines(lRes.lines || [])
        setSeries(sRes.series || [])
        setCharacters(cRes.characters || [])
        // @ts-expect-error - API shape variance
        setLists(listRes.lists || [])
    } catch (e) {
        console.error("Failed to load dropdowns", e)
    }
  }

  // --- ACTIONS ---

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(sections)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSections(items) // Optimistic

    const reorderedPayload = items.map((item, index) => ({
        id: item.id,
        order: index
    }))

    await fetch('/api/admin/home-sections/reorder', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ items: reorderedPayload })
    })
  }

  const toggleVisibility = async (id: string, current: boolean) => {
    setSections(sections.map(s => s.id === id ? { ...s, isVisible: !current } : s))
    await fetch(`/api/admin/home-sections/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ isVisible: !current })
    })
  }

  const deleteSection = async (id: string) => {
    if(!confirm('¿Estás seguro de eliminar esta sección?')) return
    setSections(sections.filter(s => s.id !== id))
    await fetch(`/api/admin/home-sections/${id}`, { method: 'DELETE' })
  }

  const openModal = (section?: HomeSection) => {
    if (section) {
        setEditingSection(section)
        const config = JSON.parse(section.config)
        
        // Determine if price filter was active
        const hasPrice = !!config.minPrice || !!config.maxPrice
        setEnablePriceFilter(hasPrice)

        setFormData({
            title: section.title,
            type: section.type as any,
            brandId: config.brandId || '',
            lineId: config.lineId || '',
            seriesId: config.seriesId || '',
            characterId: config.characterId || '',
            minPrice: config.minPrice || '',
            maxPrice: config.maxPrice || '',
            currency: config.currency || 'MXN',
            isReleased: config.isReleased === undefined ? 'all' : config.isReleased.toString(),
            search: config.search || '',
            listId: config.listId || ''
        })
    } else {
        setEditingSection(null)
        setEnablePriceFilter(false)
        setFormData({
            title: '', type: 'QUERY', brandId: '', lineId: '', seriesId: '', characterId: '',
            minPrice: '', maxPrice: '', currency: 'MXN', isReleased: 'all', search: '', listId: ''
        })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const config: any = {}
    
    if (formData.type === 'QUERY') {
        if (formData.brandId) config.brandId = formData.brandId
        if (formData.lineId) config.lineId = formData.lineId
        if (formData.seriesId) config.seriesId = formData.seriesId
        if (formData.characterId) config.characterId = formData.characterId
        if (formData.search) config.search = formData.search
        if (formData.isReleased !== 'all') config.isReleased = formData.isReleased === 'true'
        
        // Only add price if enabled
        if (enablePriceFilter) {
            if (formData.minPrice) config.minPrice = parseFloat(formData.minPrice)
            if (formData.maxPrice) config.maxPrice = parseFloat(formData.maxPrice)
            config.currency = formData.currency
        }
    } else if (formData.type === 'LIST') {
        config.listId = formData.listId
    }

    // URL Generation
    let viewAllUrl = ''
    if (formData.type === 'QUERY') {
        const params = new URLSearchParams()
        if (config.brandId) params.set('brandId', config.brandId)
        if (config.lineId) params.set('lineId', config.lineId)
        if (config.seriesId) params.set('seriesId', config.seriesId)
        if (config.characterId) params.set('characterId', config.characterId)
        if (config.search) params.set('search', config.search)
        if (config.isReleased !== undefined) params.set('isReleased', config.isReleased.toString())
        viewAllUrl = `/catalog?${params.toString()}`
    } else if (formData.type === 'LIST') {
        viewAllUrl = `/lists/${config.listId}`
    }

    const payload = {
        title: formData.title,
        type: formData.type,
        config,
        viewAllUrl
    }

    try {
        if (editingSection) {
            const res = await fetch(`/api/admin/home-sections/${editingSection.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                const updated = await res.json()
                setSections(sections.map(s => s.id === updated.id ? updated : s))
            }
        } else {
            const res = await fetch('/api/admin/home-sections', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                const created = await res.json()
                setSections([...sections, created])
            }
        }
        setIsModalOpen(false)
    } catch (error) {
        console.error('Save failed', error)
    } finally {
        setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  )

  return (
    <div className="flex-1 bg-background pb-20 pt-8 relative">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
                <Link 
                    href="/admin" 
                    className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Volver al Dashboard
                </Link>
                <h1 className="text-3xl font-title font-bold text-white">Configuración del Home</h1>
                <p className="text-gray-400 mt-1">
                    Diseña la experiencia de la página principal.
                </p>
            </div>
            <button 
                onClick={() => openModal()}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
                <Plus size={20} />
                Nueva Sección
            </button>
        </div>

        {/* List */}
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="home-sections">
            {(provided) => (
                <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="space-y-3"
                >
                {sections.map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided, snapshot) => (
                        <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                            flex items-center justify-between p-4 rounded-xl border 
                            backdrop-blur-sm transition-all group relative overflow-hidden
                            ${snapshot.isDragging 
                                ? 'bg-uiBase border-primary shadow-xl scale-[1.02] z-50' 
                                : 'bg-uiBase/40 border-white/5 hover:border-white/20 hover:bg-white/5'}
                        `}
                        >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:animate-shimmer pointer-events-none" />
                        
                        <div className="flex items-center gap-4 relative z-10">
                            <div 
                            {...provided.dragHandleProps}
                            className="p-2 rounded-lg hover:bg-white/10 cursor-grab active:cursor-grabbing text-gray-500 hover:text-white transition-colors"
                            >
                            <GripVertical size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-white text-lg tracking-tight">{section.title}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                                        section.type === 'PRESET' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                        section.type === 'QUERY' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                        'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                    }`}>
                                        {section.type === 'QUERY' && <Sparkles size={10} />}
                                        {section.type === 'LIST' && <ListIcon size={10} />}
                                        {section.type}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate max-w-[250px] mt-0.5">
                                    {section.viewAllUrl ? 'Enlace generado automátiamente' : 'Sin enlace'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 relative z-10">
                            <button
                                onClick={() => toggleVisibility(section.id, section.isVisible)}
                                className={`p-2.5 rounded-xl transition-all ${section.isVisible 
                                    ? 'text-green-400 bg-green-500/5 hover:bg-green-500/10 border border-green-500/10' 
                                    : 'text-gray-500 bg-black/20 hover:bg-black/40 border border-white/5'}`}
                                title={section.isVisible ? 'Ocultar' : 'Mostrar'}
                            >
                                {section.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>

                            {section.type !== 'PRESET' && (
                                <>
                                    <button
                                        onClick={() => openModal(section)}
                                        className="p-2.5 rounded-xl text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteSection(section.id)}
                                        className="p-2.5 rounded-xl text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                        </div>
                    )}
                    </Draggable>
                ))}
                {provided.placeholder}
                </div>
            )}
            </Droppable>
        </DragDropContext>

      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    onClick={() => setIsModalOpen(false)}
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
                >
                    {/* Modal Header */}
                    <div className="flex justify-between items-center p-6 border-b border-white/5">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight font-title">
                                {editingSection ? 'Editar Sección' : 'Nueva Sección'}
                            </h2>
                            <p className="text-sm text-gray-400">Configura qué mostrar en este bloque.</p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="overflow-y-auto custom-scrollbar p-6 space-y-8">
                        
                        {/* 1. Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2 block ml-1">Título de la Sección</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-gray-600 font-bold"
                                    placeholder="Ej: Lo mejor de Marvel"
                                />
                            </div>

                            {/* Type Selector */}
                            <div className="grid grid-cols-2 gap-3 p-1 bg-white/5 rounded-2xl border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'QUERY'})}
                                    className={`flex flex-col items-center justify-center py-4 rounded-xl transition-all duration-300 border ${
                                        formData.type === 'QUERY' 
                                        ? 'bg-primary/10 border-primary/50 text-primary shadow-lg shadow-primary/10' 
                                        : 'border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'
                                    }`}
                                >
                                    <Sparkles size={24} className="mb-2" />
                                    <span className="font-bold text-sm">Smart Query</span>
                                    <span className="text-[10px] opacity-60 font-normal">Filtros automáticos</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'LIST'})}
                                    className={`flex flex-col items-center justify-center py-4 rounded-xl transition-all duration-300 border ${
                                        formData.type === 'LIST' 
                                        ? 'bg-orange-500/10 border-orange-500/50 text-orange-400 shadow-lg shadow-orange-500/10' 
                                        : 'border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'
                                    }`}
                                >
                                    <ListIcon size={24} className="mb-2" />
                                    <span className="font-bold text-sm">Lista Manual</span>
                                    <span className="text-[10px] opacity-60 font-normal">Selección estática</span>
                                </button>
                            </div>
                        </div>

                        {/* 2. Query Config */}
                        {formData.type === 'QUERY' && (
                            <div className="space-y-6">
                                {/* Categorization */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-400 mb-2 px-1">
                                        <Filter size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Filtros de Categoría</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 ml-1">Marca</label>
                                            <select 
                                                value={formData.brandId}
                                                onChange={e => setFormData({...formData, brandId: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary focus:outline-none appearance-none [&>option]:bg-gray-800 [&>option]:text-white"
                                            >
                                                <option value="">Todas las marcas</option>
                                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 ml-1">Línea</label>
                                            <select 
                                                value={formData.lineId}
                                                onChange={e => setFormData({...formData, lineId: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary focus:outline-none appearance-none [&>option]:bg-gray-800 [&>option]:text-white"
                                            >
                                                <option value="">Todas las líneas</option>
                                                {lines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 ml-1">Serie</label>
                                            <select 
                                                value={formData.seriesId}
                                                onChange={e => setFormData({...formData, seriesId: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary focus:outline-none appearance-none [&>option]:bg-gray-800 [&>option]:text-white"
                                            >
                                                <option value="">Todas las series</option>
                                                {series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 ml-1">Personaje</label>
                                            <select 
                                                value={formData.characterId}
                                                onChange={e => setFormData({...formData, characterId: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary focus:outline-none appearance-none [&>option]:bg-gray-800 [&>option]:text-white"
                                            >
                                                <option value="">Todos los personajes</option>
                                                {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Specifics */}
                                <div className="space-y-3 pt-2 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-gray-400 mb-2 px-1">
                                        <Tag size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Detalles Específicos</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-3.5 text-gray-500" size={16} />
                                            <select 
                                                value={formData.isReleased}
                                                onChange={e => setFormData({...formData, isReleased: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-primary focus:outline-none appearance-none [&>option]:bg-gray-800 [&>option]:text-white"
                                            >
                                                <option value="all">Cualquier Estado (Lanzado o Pre-orden)</option>
                                                <option value="true">✅ Ya Lanzados</option>
                                                <option value="false">📅 Pre-orden / Futuros</option>
                                            </select>
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-3.5 text-gray-500" size={16} />
                                            <input 
                                                type="text"
                                                value={formData.search}
                                                onChange={e => setFormData({...formData, search: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-primary focus:outline-none placeholder:text-gray-600"
                                                placeholder="Palabra clave (ej. Goku)"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Price Toggle Section */}
                                <div className="space-y-3 pt-2 border-t border-white/5">
                                    <div className="flex items-center justify-between px-1 mb-2">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <DollarSign size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Filtro de Precio</span>
                                        </div>
                                        
                                        {/* Custom Switch UI */}
                                        <button
                                            type="button"
                                            onClick={() => setEnablePriceFilter(!enablePriceFilter)}
                                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${enablePriceFilter ? 'bg-primary' : 'bg-white/10'}`}
                                        >
                                            <motion.div 
                                                animate={{ x: enablePriceFilter ? 24 : 2 }}
                                                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                                            />
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {enablePriceFilter && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 grid grid-cols-3 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-gray-500 uppercase">Moneda</label>
                                                        <select 
                                                            value={formData.currency}
                                                            onChange={e => setFormData({...formData, currency: e.target.value})}
                                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none [&>option]:bg-gray-800 [&>option]:text-white"
                                                        >
                                                            <option value="MXN">MXN ($)</option>
                                                            <option value="USD">USD ($)</option>
                                                            <option value="YEN">YEN (¥)</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-gray-500 uppercase">Mínimo</label>
                                                        <input 
                                                            type="number"
                                                            value={formData.minPrice}
                                                            onChange={e => setFormData({...formData, minPrice: e.target.value})}
                                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-gray-500 uppercase">Máximo</label>
                                                        <input 
                                                            type="number"
                                                            value={formData.maxPrice}
                                                            onChange={e => setFormData({...formData, maxPrice: e.target.value})}
                                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                                                            placeholder="Sin límite"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {formData.type === 'LIST' && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
                                <label className="block text-sm font-bold text-orange-200 mb-2">Seleccionar Lista Existente</label>
                                <div className="relative">
                                    <select 
                                        required
                                        value={formData.listId}
                                        onChange={e => setFormData({...formData, listId: e.target.value})}
                                        className="w-full bg-black/40 border border-orange-500/30 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none appearance-none [&>option]:bg-gray-800 [&>option]:text-white"
                                    >
                                        <option value="">Selecciona una lista...</option>
                                        {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                    <ListIcon className="absolute right-4 top-3.5 text-orange-500/50 pointer-events-none" size={18} />
                                </div>
                                <p className="text-xs text-orange-400/60 mt-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    Se mostrarán automáticamente las primeras 15 figuras de la lista seleccionada.
                                </p>
                            </div>
                        )}

                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/20">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={saving}
                            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  )
}
