'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, X, ArrowRight, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'

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

const DAYS = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB']

export default function CalendarClient({ brands, lines }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedLine, setSelectedLine] = useState('')
  const [figures, setFigures] = useState<Figure[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDayFigures, setSelectedDayFigures] = useState<{ day: number, figures: Figure[] } | null>(null)
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
      if (!selectedBrand) {
         setFigures([])
         setLoading(false)
         return
      }
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

  // Calendar Logic
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  // Group figures by day
  const figuresByDay = figures.reduce((acc, fig) => {
    const day = new Date(fig.releaseDate).getDate()
    if (!acc[day]) acc[day] = []
    acc[day].push(fig)
    return acc
  }, {} as Record<number, Figure[]>)

  return (
    <div className="flex-1 bg-background pb-20 relative overflow-hidden">
        {/* Ambient Background */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-8 mb-6 md:mb-12">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-2xl md:text-4xl font-title font-black text-white mb-1 md:mb-2">
                        Calendario de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Lanzamientos</span>
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Mantente al día con las fechas oficiales de salida.
                    </p>
                </motion.div>

                {/* Mobile Filter Toggle */}
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="md:hidden flex items-center justify-center gap-2 bg-white/5 px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/10 w-full"
                >
                  <SlidersHorizontal size={16} className="text-primary" />
                  <span className="text-sm font-medium text-white">Filtros</span>
                  <motion.div
                    animate={{ rotate: filtersOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} className="text-gray-400" />
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
                      className="md:hidden overflow-hidden w-full"
                    >
                      <div className="flex flex-wrap gap-2 bg-white/5 p-3 rounded-xl backdrop-blur-md border border-white/10">
                        {/* Brand Select */}
                        <div className="relative w-full">
                          <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Marca</p>
                          <select
                            value={selectedBrand}
                            onChange={(e) => handleBrandChange(e.target.value)}
                            className="w-full appearance-none bg-black/40 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer text-center"
                          >
                            <option value="" disabled className="bg-[#1a1a1a] text-gray-400">Selecciona una Marca</option>
                            {brands.map(b => (
                              <option key={b.id} value={b.id} className="bg-[#1a1a1a] text-white">{b.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-[calc(50%+2px)] -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>

                        {/* Line Select */}
                        <div className="relative w-full">
                          <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Línea</p>
                          <select
                            value={selectedLine}
                            onChange={(e) => setSelectedLine(e.target.value)}
                            disabled={!selectedBrand}
                            className="w-full appearance-none bg-black/40 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
                          >
                            <option value="" className="bg-[#1a1a1a] text-gray-400">Selecciona una Línea</option>
                            {filteredLines.map(l => (
                              <option key={l.id} value={l.id} className="bg-[#1a1a1a] text-white">{l.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-[calc(50%+2px)] -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Desktop Filters - Always Visible */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden md:flex flex-wrap gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md"
                >
                    {/* Brand Select */}
                    <div className="relative min-w-[180px]">
                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Marca</p>
                        <select
                            value={selectedBrand}
                            onChange={(e) => handleBrandChange(e.target.value)}
                            className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                        >
                            <option value="" disabled className="bg-[#1a1a1a] text-gray-400">Selecciona una Marca</option>
                            {brands.map(b => (
                                <option key={b.id} value={b.id} className="bg-[#1a1a1a] text-white">{b.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-[calc(50%+10px)] -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>

                    {/* Line Select */}
                    <div className="relative min-w-[180px]">
                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Línea</p>
                        <select
                            value={selectedLine}
                            onChange={(e) => setSelectedLine(e.target.value)}
                            disabled={!selectedBrand}
                            className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="" className="bg-[#1a1a1a] text-gray-400">
                                Selecciona una Línea
                            </option>
                            {filteredLines.map(l => (
                                <option key={l.id} value={l.id} className="bg-[#1a1a1a] text-white">{l.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-[calc(50%+10px)] -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </motion.div>
            </div>

            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-6 bg-uiBase/40 backdrop-blur-xl py-2 px-3 md:p-4 rounded-xl md:rounded-2xl border border-white/10">
                <button
                    onClick={handlePrevMonth}
                    disabled={!selectedBrand}
                    className="p-1.5 md:p-2 rounded-full hover:bg-white/10 text-white transition-colors disabled:opacity-30"
                >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                <h2 className="text-base md:text-2xl font-title font-bold text-white uppercase tracking-wider">
                    {currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                </h2>

                <button
                    onClick={handleNextMonth}
                    disabled={!selectedBrand}
                    className="p-1.5 md:p-2 rounded-full hover:bg-white/10 text-white transition-colors disabled:opacity-30"
                >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            </div>

            {/* Month Grid */}
            <div className="bg-uiBase/30 backdrop-blur-md rounded-3xl p-1 md:p-6 border border-white/10 shadow-2xl relative min-h-[500px]">
                
                {!selectedBrand && (
                   <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-3xl">
                       <div className="bg-white/10 p-6 rounded-full mb-4">
                           <Filter size={48} className="text-primary" />
                       </div>
                       <h3 className="text-2xl font-bold text-white mb-2">Selecciona una Marca</h3>
                       <p className="text-gray-400">Para ver el calendario de lanzamientos.</p>
                   </div>
                )}

                {/* Day Headers */}
                <div className="grid grid-cols-7 mb-4">
                    {DAYS.map(day => (
                        <div key={day} className="text-center text-gray-500 text-xs font-bold tracking-widest py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 md:gap-3 auto-rows-[80px] md:auto-rows-[140px]">
                    {days.map((day, index) => {
                        const dayFigures = day ? figuresByDay[day] : []
                        const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()

                        return (
                            <div 
                                key={index} 
                                onClick={() => day && dayFigures?.length ? setSelectedDayFigures({ day, figures: dayFigures }) : null}
                                className={`
                                    relative rounded-xl border p-2 transition-all
                                    ${!day ? 'bg-transparent border-transparent' : 'bg-white/5 border-white/5 hover:bg-white/10 cursor-pointer'}
                                    ${isToday ? 'ring-1 ring-primary bg-primary/10' : ''}
                                    ${dayFigures?.length ? 'hover:border-primary/50 hover:shadow-[0_0_15px_rgba(225,6,44,0.2)]' : ''}
                                `}
                            >
                                {day && (
                                    <>
                                        <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-gray-400'}`}>
                                            {day}
                                        </span>
                                        
                                        {/* Preview Images */}
                                        {dayFigures && dayFigures.length > 0 && (
                                            <div className="absolute inset-2 top-8 flex flex-wrap content-end gap-1">
                                                {dayFigures.slice(0, 3).map((fig, i) => (
                                                    <div key={fig.id} className="relative flex-grow h-full max-h-[80%] min-w-[30%] rounded-md overflow-hidden bg-black">
                                                        {fig.images[0] && (
                                                            <img src={fig.images[0].url} alt="" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                                                        )}
                                                    </div>
                                                ))}
                                                {dayFigures.length > 3 && (
                                                    <div className="absolute bottom-0 right-0 bg-primary text-white text-[10px] font-bold px-1 rounded">
                                                        +{dayFigures.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
            {selectedDayFigures && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedDayFigures(null)}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-[#1a1a1a] rounded-3xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-uiBase">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <CalendarIcon className="text-primary" size={20} />
                                Lanzamientos del {selectedDayFigures.day} de {currentDate.toLocaleDateString('es-MX', { month: 'long' })}
                            </h3>
                            <button onClick={() => setSelectedDayFigures(null)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                            {selectedDayFigures.figures.map(fig => (
                                <Link key={fig.id} href={`/catalog/${fig.id}`} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/20 group">
                                    <div className="w-16 h-16 rounded-lg bg-black overflow-hidden flex-shrink-0">
                                        {fig.images[0] && (
                                            <img src={fig.images[0].url} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-white group-hover:text-primary transition-colors">{fig.name}</h4>
                                        <p className="text-xs text-gray-400">{fig.brand.name} • {fig.line.name}</p>
                                    </div>
                                    <ArrowRight size={20} className="text-gray-600 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  )
}
