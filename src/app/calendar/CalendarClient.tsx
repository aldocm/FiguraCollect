'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, SlidersHorizontal, Clock } from 'lucide-react'

type Figure = {
  id: string
  name: string
  releaseDate: string
  brand: { name: string }
  line: { name: string }
  images: { url: string }[]
}

interface CalendarClientProps {
  brands: { id: string; name: string }[]
  lines: { id: string; name: string; brandId?: string }[]
}

// Figure Card Component
const FigureCard = ({ fig }: { fig: Figure }) => (
  <Link
    href={`/catalog/${fig.id}`}
    className="group relative aspect-[3/4] bg-uiBase/50 rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all shadow-lg hover:shadow-primary/10"
  >
    {/* Image */}
    <div className="w-full h-full">
      {fig.images[0] ? (
        <img
          src={fig.images[0].url}
          alt={fig.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-600 bg-black/20">
          <CalendarIcon size={32} />
        </div>
      )}
    </div>

    {/* Overlay Gradient */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

    {/* Content */}
    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition-transform">
      <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-0.5">
        {fig.brand.name}
      </p>
      <h4 className="text-sm font-bold text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
        {fig.name}
      </h4>
      <p className="text-[10px] text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {fig.line.name}
      </p>
    </div>
  </Link>
)

export default function CalendarClient({ brands, lines }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedLine, setSelectedLine] = useState('')
  const [figures, setFigures] = useState<Figure[]>([])
  const [loading, setLoading] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // --- Filter Logic ---
  const filteredLines = useMemo(() => {
    if (!selectedBrand) return lines
    return lines.filter(l => l.brandId === selectedBrand)
  }, [lines, selectedBrand])

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId)
    setSelectedLine('')
  }

  useEffect(() => {
    const fetchFigures = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          month: month.toString(),
          year: year.toString()
        })
        if (selectedBrand) params.append('brandId', selectedBrand)
        if (selectedLine) params.append('lineId', selectedLine)

        const res = await fetch(`/api/calendar/releases?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setFigures(data.figures)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchFigures()
  }, [year, month, selectedBrand, selectedLine])

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  // Separate figures: those with exact day vs only month
  const { figuresWithDay, figuresMonthOnly } = useMemo(() => {
    const withDay: Figure[] = []
    const monthOnly: Figure[] = []

    figures.forEach(fig => {
      // If releaseDate is "YYYY-MM" (7 chars) = month only
      // If releaseDate is "YYYY-MM-DD" (10 chars) = has specific day
      if (fig.releaseDate.length > 7) {
        withDay.push(fig)
      } else {
        monthOnly.push(fig)
      }
    })

    return { figuresWithDay: withDay, figuresMonthOnly: monthOnly }
  }, [figures])

  // Group figures WITH specific day by day number
  const figuresByDay = figuresWithDay.reduce((acc, fig) => {
    const day = new Date(fig.releaseDate).getDate()
    if (!acc[day]) acc[day] = []
    acc[day].push(fig)
    return acc
  }, {} as Record<number, Figure[]>)

  return (
    <div className="flex-1 bg-background pb-20 relative min-h-screen">
        {/* Ambient Background */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-2xl md:text-4xl font-title font-black text-white mb-1 md:mb-2">
                        Calendario de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Lanzamientos</span>
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Explora las fechas de salida confirmadas. Organiza tu colección y no pierdas de vista tus figuras más esperadas.
                    </p>
                </motion.div>

                {/* Desktop Filters */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden lg:flex flex-wrap items-end gap-4"
                >
                    {/* Brand Select */}
                    <div className="w-48">
                        <label className="block text-xs text-gray-500 uppercase font-bold mb-2 ml-1">Filtrar por Marca</label>
                        <div className="relative">
                            <select
                                value={selectedBrand}
                                onChange={(e) => handleBrandChange(e.target.value)}
                                className="w-full appearance-none bg-uiBase/50 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer hover:bg-uiBase/80"
                            >
                                <option value="" className="bg-[#1a1a1a] text-gray-400">Todas las marcas</option>
                                {brands.map(b => (
                                    <option key={b.id} value={b.id} className="bg-[#1a1a1a] text-white">{b.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Line Select */}
                    <div className="w-48">
                         <label className="block text-xs text-gray-500 uppercase font-bold mb-2 ml-1">Filtrar por Línea</label>
                        <div className="relative">
                            <select
                                value={selectedLine}
                                onChange={(e) => setSelectedLine(e.target.value)}
                                disabled={!selectedBrand || filteredLines.length === 0}
                                className="w-full appearance-none bg-uiBase/50 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-uiBase/80"
                            >
                                <option value="" className="bg-[#1a1a1a] text-gray-400">
                                    Selecciona una Línea
                                </option>
                                {filteredLines.map(l => (
                                    <option key={l.id} value={l.id} className="bg-[#1a1a1a] text-white">{l.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </motion.div>
                
                 {/* Mobile Filter Toggle */}
                 <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="lg:hidden flex items-center justify-between bg-uiBase/50 px-4 py-3 rounded-xl border border-white/10 w-full"
                >
                  <div className="flex items-center gap-3">
                      <div className="bg-primary/20 p-2 rounded-lg">
                        <SlidersHorizontal size={18} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium text-white">Filtros de búsqueda</span>
                  </div>
                  <motion.div
                    animate={{ rotate: filtersOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} className="text-gray-400" />
                  </motion.div>
                </motion.button>

                {/* Mobile Filters - Collapsible */}
                <AnimatePresence>
                  {filtersOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="lg:hidden overflow-hidden w-full"
                    >
                      <div className="flex flex-col gap-3 bg-uiBase/30 p-4 rounded-xl border border-white/10 mt-2">
                        {/* Brand Select */}
                        <div className="relative w-full">
                          <p className="text-[10px] text-gray-400 uppercase font-bold mb-1.5">Marca</p>
                          <select
                            value={selectedBrand}
                            onChange={(e) => handleBrandChange(e.target.value)}
                            className="w-full appearance-none bg-black/40 border border-white/10 rounded-lg pl-3 pr-8 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                          >
                            <option value="" className="bg-[#1a1a1a] text-gray-400">Todas las marcas</option>
                            {brands.map(b => (
                              <option key={b.id} value={b.id} className="bg-[#1a1a1a] text-white">{b.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-[calc(50%+10px)] -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>

                        {/* Line Select */}
                        <div className="relative w-full">
                          <p className="text-[10px] text-gray-400 uppercase font-bold mb-1.5">Línea</p>
                          <select
                            value={selectedLine}
                            onChange={(e) => setSelectedLine(e.target.value)}
                            disabled={!selectedBrand || filteredLines.length === 0}
                            className="w-full appearance-none bg-black/40 border border-white/10 rounded-lg pl-3 pr-8 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="" className="bg-[#1a1a1a] text-gray-400">Selecciona una Línea</option>
                            {filteredLines.map(l => (
                              <option key={l.id} value={l.id} className="bg-[#1a1a1a] text-white">{l.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-[calc(50%+10px)] -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>

            {/* Calendar Controls */}
            <div className="sticky top-4 z-20 bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 mb-8">
                <div className="flex items-center justify-between p-2 md:p-3">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 md:p-3 rounded-xl hover:bg-white/10 text-white transition-all active:scale-95"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    <div className="flex flex-col items-center">
                        <h2 className="text-lg md:text-2xl font-title font-black text-white uppercase tracking-wider">
                            {currentDate.toLocaleDateString('es-MX', { month: 'long' })}
                        </h2>
                        <span className="text-xs md:text-sm text-primary font-bold">
                            {year}
                        </span>
                    </div>

                    <button
                        onClick={handleNextMonth}
                        className="p-2 md:p-3 rounded-xl hover:bg-white/10 text-white transition-all active:scale-95"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>
            </div>

            {/* Calendar Content */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="min-h-[400px] flex flex-col items-center justify-center bg-uiBase/20 rounded-3xl border border-white/5"
                >
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <CalendarIcon className="absolute inset-0 m-auto text-primary/50" size={24} />
                    </div>
                    <p className="text-gray-400 mt-4 font-medium animate-pulse">Consultando oráculo...</p>
                </motion.div>
              ) : figuresMonthOnly.length === 0 && Object.keys(figuresByDay).length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="min-h-[400px] flex flex-col items-center justify-center bg-uiBase/20 rounded-3xl border border-white/5 text-center p-8"
                >
                  <div className="bg-white/5 p-6 rounded-full mb-4">
                    <CalendarIcon size={48} className="text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Sin lanzamientos</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    No hemos encontrado figuras programadas para este mes con los filtros actuales. Intenta cambiar de mes o limpiar los filtros.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={`content-${year}-${month}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Month Releases (Figures without specific day) */}
                  {figuresMonthOnly.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 ml-1">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Clock size={20} className="text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Lanzamientos del Mes</h3>
                            <p className="text-xs text-gray-400">Fecha exacta por confirmar</p>
                        </div>
                        <span className="ml-auto text-xs bg-white/10 text-white px-3 py-1 rounded-full font-medium">
                          {figuresMonthOnly.length}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 md:gap-3">
                        {figuresMonthOnly.map(fig => (
                          <FigureCard key={fig.id} fig={fig} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Divider if both exist */}
                  {figuresMonthOnly.length > 0 && Object.keys(figuresByDay).length > 0 && (
                      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8" />
                  )}

                  {/* Daily Releases */}
                  <div className="space-y-6">
                    {Object.entries(figuresByDay)
                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                        .map(([day, dayFigures]) => {
                        const isToday = parseInt(day) === new Date().getDate() &&
                                        month === new Date().getMonth() &&
                                        year === new Date().getFullYear()
                        
                        const dateObj = new Date(year, month, parseInt(day))
                        
                        return (
                            <div key={day} className="relative">
                                {isToday && (
                                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary rounded-full hidden md:block shadow-[0_0_15px_rgba(225,6,44,0.6)]" />
                                )}
                                
                                {/* Day Header */}
                                <div className={`flex items-center gap-4 mb-4 ${isToday ? 'ml-2' : ''}`}>
                                    <div className={`flex flex-col items-center justify-center w-12 h-14 md:w-14 md:h-16 rounded-2xl border shadow-lg ${
                                        isToday 
                                            ? 'bg-primary text-white border-primary shadow-primary/30' 
                                            : 'bg-uiBase/80 text-gray-400 border-white/10'
                                    }`}>
                                        <span className="text-xs uppercase font-bold tracking-wider opacity-80">
                                            {dateObj.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '')}
                                        </span>
                                        <span className="text-xl md:text-2xl font-black leading-none">
                                            {day}
                                        </span>
                                    </div>
                                    
                                    <div className="h-px flex-1 bg-white/10" />
                                    
                                    {isToday && (
                                        <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full border border-primary/20 animate-pulse">
                                            HOY
                                        </span>
                                    )}
                                </div>

                                {/* Figures Grid for Day */}
                                <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 md:gap-3 ${isToday ? 'pl-2 md:pl-0' : ''}`}>
                                    {dayFigures.map(fig => (
                                        <FigureCard key={fig.id} fig={fig} />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>
    </div>
  )
}
