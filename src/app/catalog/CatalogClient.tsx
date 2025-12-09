'use client'

import { useState, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Brand, Figure, FigureImage, Line } from '@prisma/client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, X, Filter, Search, Circle, Clock } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface SeriesData {
    id: string
    name: string
    _count: { figures: number }
    brandIds: string[]
    lineIds: string[]
}

interface CharacterData {
    id: string
    name: string
    series: { id: string; name: string } | null
    _count: { figures: number }
}

interface CatalogClientProps {
  figures: (Figure & {
    brand: Brand
    line: Line
    images: FigureImage[]
  })[]
  brands: (Brand & { _count: { figures: number } })[]
  lines: (Line & { _count: { figures: number }, brandId: string })[]
  series: SeriesData[]
  characters: CharacterData[]
  page: number
  pages: number
}

// --- Filter Logic Helper ---
const toggleValue = (currentValues: string[], value: string) => {
    if (currentValues.includes(value)) {
        return currentValues.filter(v => v !== value)
    }
    return [...currentValues, value]
}

// --- Subcomponents for Filters ---

interface FilterItemProps {
  label: string
  count?: number
  isSelected: boolean
  isMulti?: boolean
  onClick: () => void
}

const FilterItem = ({ label, count, isSelected, isMulti = false, onClick }: FilterItemProps) => {
  return (
    <motion.button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-all duration-200 group
        ${isSelected 
          ? 'bg-primary/10 text-primary font-medium border border-primary/20' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }
      `}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="flex items-center gap-2">
        <div className={`
          w-4 h-4 flex items-center justify-center transition-colors
          ${isMulti ? 'rounded border' : 'rounded-full border'}
          ${isSelected ? 'bg-primary border-primary' : 'border-gray-600 group-hover:border-gray-400 bg-transparent'}
        `}>
          {isSelected && (
             isMulti ? <Check size={10} className="text-white" /> : <Circle size={6} fill="currentColor" className="text-white" />
          )}
        </div>
        <span className="truncate max-w-[140px] text-left">{label}</span>
      </span>
      {count !== undefined && (
        <span className={`text-xs ${isSelected ? 'text-primary' : 'text-gray-600 group-hover:text-gray-500'}`}>
          {count}
        </span>
      )}
    </motion.button>
  )
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  onSearch?: (term: string) => void
}

const FilterSection = ({ title, children, defaultOpen = true, onSearch }: FilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`border-b border-white/5 last:border-0 ${isOpen ? 'py-4' : 'py-3'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full text-left group ${isOpen ? 'mb-2' : 'mb-1'}`}
      >
        <span className={`font-title font-bold group-hover:text-primary transition-colors ${isOpen ? 'text-textWhite' : 'text-gray-400 text-sm'}`}>
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-500 group-hover:text-white"
        >
          <ChevronDown size={isOpen ? 18 : 16} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {onSearch && (
                <div className="px-1 pb-2">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg py-1.5 pl-8 pr-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>
            )}
            <div className="space-y-1 pt-1 pb-2 max-h-[300px] overflow-y-auto custom-scrollbar px-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- Searchable List Wrapper ---
interface SearchableFilterListProps<T> {
    title: string
    items: T[]
    keyProp: keyof T
    labelProp: keyof T
    countProp?: string // path to count like '_count.figures' handled manually
    selectedValues: string[] // array for multi, array of 1 for single
    isMulti?: boolean
    allLabel?: string
    onSelect: (id: string | null) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SearchableFilterList<T extends { [key: string]: any }>({ title, items, keyProp, labelProp, selectedValues, isMulti, allLabel, onSelect }: SearchableFilterListProps<T>) {
    const [searchTerm, setSearchTerm] = useState('')
    
    const filteredItems = useMemo(() => {
        if (!searchTerm) return items
        return items.filter(item => 
            String(item[labelProp]).toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [items, searchTerm, labelProp])

    return (
        <FilterSection title={title} defaultOpen={true} onSearch={setSearchTerm}>
            {items.length === 0 && !allLabel ? (
                 <p className="text-xs text-gray-500 italic px-2">No hay opciones disponibles.</p>
            ) : (
                <>
                    {allLabel && (
                        <FilterItem 
                            label={allLabel}
                            isSelected={selectedValues.length === 0}
                            isMulti={false} // Always radio-like behavior for "All" (clears everything)
                            onClick={() => onSelect(null)}
                        />
                    )}
                    {filteredItems.map((item) => (
                        <FilterItem 
                            key={item[keyProp]}
                            label={item[labelProp]}
                            count={item._count?.figures}
                            isSelected={selectedValues.includes(item[keyProp])}
                            isMulti={isMulti}
                            onClick={() => onSelect(item[keyProp])}
                        />
                    ))}
                    {filteredItems.length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-2">Sin resultados</p>
                    )}
                </>
            )}
        </FilterSection>
    )
}


// --- Main Component ---

export default function CatalogClient({
  figures,
  brands,
  lines,
  series,
  characters,
  page,
  pages
}: CatalogClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useLanguage()

  const [activeMobileFilters, setActiveMobileFilters] = useState(false)

  // --- Filter Logic ---
  const selectedBrandId = searchParams.get('brandId')
  const selectedLineIds = useMemo(() => searchParams.get('lineId')?.split(',').filter(Boolean) || [], [searchParams])
  const selectedSeriesIds = useMemo(() => searchParams.get('seriesId')?.split(',').filter(Boolean) || [], [searchParams])
  const selectedCharacterId = searchParams.get('characterId')

  // Smart Filtering of Options
  const filteredLines = useMemo(() => {
      if (!selectedBrandId) return lines
      return lines.filter(l => l.brandId === selectedBrandId)
  }, [lines, selectedBrandId])

  const filteredSeries = useMemo(() => {
      return series.filter(s => {
          const matchBrand = selectedBrandId ? s.brandIds.includes(selectedBrandId) : true
          // If any line is selected, series must belong to at least one of them?
          // Or strictly match? Usually "belongs to any of the selected lines".
          const matchLine = selectedLineIds.length > 0
              ? s.lineIds.some(id => selectedLineIds.includes(id))
              : true

          return matchBrand && matchLine
      })
  }, [series, selectedBrandId, selectedLineIds])

  // Filter characters by selected series
  const filteredCharacters = useMemo(() => {
      if (selectedSeriesIds.length === 0) return characters
      return characters.filter(c =>
          c.series && selectedSeriesIds.includes(c.series.id)
      )
  }, [characters, selectedSeriesIds])


  const handleUpdateParams = (key: string, value: string | string[] | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null || (Array.isArray(value) && value.length === 0)) {
          params.delete(key)
      } else if (Array.isArray(value)) {
          params.set(key, value.join(','))
      } else {
          params.set(key, value)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Specific Handlers
  const handleBrandSelect = (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (id === null) {
          params.delete('brandId')
          params.delete('lineId')
          params.delete('seriesId')
      } else if (selectedBrandId === id) {
          params.delete('brandId')
      } else {
          params.set('brandId', id)
          params.delete('lineId')
          params.delete('seriesId')
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleLineSelect = (id: string | null) => {
      if (id === null) {
          handleUpdateParams('lineId', null)
          return
      }
      const newIds = toggleValue(selectedLineIds, id)
      handleUpdateParams('lineId', newIds)
  }

  const handleSeriesSelect = (id: string | null) => {
      if (id === null) {
          handleUpdateParams('seriesId', null)
          return
      }
      const newIds = toggleValue(selectedSeriesIds, id)
      handleUpdateParams('seriesId', newIds)
  }

  const handleCharacterSelect = (id: string | null) => {
      if (id === null || selectedCharacterId === id) {
          handleUpdateParams('characterId', null)
      } else {
          handleUpdateParams('characterId', id)
      }
  }

  // Clear all filters
  const clearFilters = () => {
    router.push(pathname)
  }

  const hasActiveFilters =
    searchParams.has('brandId') ||
    searchParams.has('lineId') ||
    searchParams.has('seriesId') ||
    searchParams.has('characterId') ||
    searchParams.has('isReleased')

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15
      }
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 relative flex-1">
      
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-2 flex justify-between items-center bg-uiBase rounded-xl border border-white/10">
        <button
          onClick={() => setActiveMobileFilters(!activeMobileFilters)}
          className="flex items-center gap-2 text-white font-medium px-4 py-3"
        >
          <Filter size={20} className="text-primary" />
          {t.catalog.filters} {hasActiveFilters && <span className="w-2 h-2 bg-accent rounded-full" />}
        </button>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-white px-4 py-3">
            {t.catalog.clearAll}
          </button>
        )}
      </div>

      {/* Sidebar Filters */}
      <aside className={`
        fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none lg:static lg:z-auto lg:w-72 lg:flex-shrink-0
        transition-transform duration-300 ease-in-out lg:transform-none overflow-y-auto lg:overflow-visible p-6 lg:p-0
        ${activeMobileFilters ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="sticky top-24 space-y-1">
          <div className="flex items-center justify-between mb-6 lg:hidden">
             <h2 className="text-xl font-title font-bold">{t.catalog.filters}</h2>
             <button onClick={() => setActiveMobileFilters(false)} className="p-2">
               <X size={24} />
             </button>
          </div>

          <div className="hidden lg:flex items-center justify-between mb-4">
            <h3 className="font-title font-bold text-lg text-white flex items-center gap-2">
              <Filter size={18} className="text-primary" /> {t.catalog.filters}
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-accent hover:text-white transition-colors"
              >
                {t.catalog.clear}
              </button>
            )}
          </div>

          <div className="bg-uiBase/50 rounded-xl border border-white/5 p-4 backdrop-blur-sm">
            <FilterSection title={t.catalog.status} defaultOpen={false}>
              <FilterItem
                label={t.catalog.all}
                isSelected={!searchParams.get('isReleased')}
                onClick={() => handleUpdateParams('isReleased', null)}
              />
              <FilterItem
                label={t.catalog.released}
                isSelected={searchParams.get('isReleased') === 'true'}
                onClick={() => handleUpdateParams('isReleased', 'true')}
              />
              <FilterItem
                label={t.catalog.upcoming}
                isSelected={searchParams.get('isReleased') === 'false'}
                onClick={() => handleUpdateParams('isReleased', 'false')}
              />
            </FilterSection>

            {/* Brand Filter - Single Select with Search */}
            <SearchableFilterList
                title={t.catalog.brands}
                items={brands}
                keyProp="id"
                labelProp="name"
                allLabel={t.catalog.allBrands}
                selectedValues={selectedBrandId ? [selectedBrandId] : []}
                onSelect={handleBrandSelect}
                isMulti={false}
            />

            {/* Line Filter - Multi Select with Search */}
            <SearchableFilterList
                title={t.catalog.lines}
                items={filteredLines}
                keyProp="id"
                labelProp="name"
                allLabel={t.catalog.allLines}
                selectedValues={selectedLineIds}
                onSelect={handleLineSelect}
                isMulti={true}
            />

            {/* Series Filter - Multi Select with Search */}
            <SearchableFilterList
                title={t.catalog.series}
                items={filteredSeries}
                keyProp="id"
                labelProp="name"
                allLabel={t.catalog.allSeries}
                selectedValues={selectedSeriesIds}
                onSelect={handleSeriesSelect}
                isMulti={true}
            />

            {/* Character Filter - Single Select with Search */}
            <FilterSection title={t.catalog.characters} defaultOpen={false} onSearch={undefined}>
                <FilterItem
                    label={t.catalog.allCharacters}
                    isSelected={!selectedCharacterId}
                    isMulti={false}
                    onClick={() => handleCharacterSelect(null)}
                />
                {filteredCharacters.map(c => (
                    <FilterItem
                        key={c.id}
                        label={c.series ? `${c.name} (${c.series.name})` : c.name}
                        count={c._count.figures}
                        isSelected={selectedCharacterId === c.id}
                        isMulti={false}
                        onClick={() => handleCharacterSelect(c.id)}
                    />
                ))}
                {filteredCharacters.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-2">
                        {selectedSeriesIds.length > 0 ? t.catalog.noCharactersInSeries : t.catalog.noCharacters}
                    </p>
                )}
            </FilterSection>

          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {figures.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-[60vh] text-center p-8 border border-dashed border-white/10 rounded-2xl bg-uiBase/30"
          >
            <div className="w-20 h-20 bg-uiBase rounded-full flex items-center justify-center mb-6">
              <Search size={32} className="text-gray-500" />
            </div>
            <h3 className="text-2xl font-title font-bold text-white mb-2">{t.catalog.noResults}</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              {t.catalog.adjustFilters}
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-full font-medium transition-colors shadow-[0_0_20px_-5px_rgba(225,6,44,0.4)]"
            >
              {t.catalog.clearAllFilters}
            </button>
          </motion.div>
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-gray-400 text-sm">
                {t.catalog.showing} <span className="text-white font-bold">{figures.length}</span> {t.catalog.results}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 hidden sm:block">{t.catalog.sortBy}</span>
                <div className="relative">
                  <select
                    value={searchParams.get('sort') || 'newest'}
                    onChange={(e) => handleUpdateParams('sort', e.target.value)}
                    className="appearance-none bg-uiBase border border-white/10 rounded-lg py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-primary/50 cursor-pointer hover:border-white/20 transition-colors"
                  >
                    <option value="newest">{t.catalog.recent}</option>
                    <option value="date_asc">{t.catalog.dateOldNew}</option>
                    <option value="date_desc">{t.catalog.dateNewOld}</option>
                    <option value="price_asc">{t.catalog.priceLowHigh}</option>
                    <option value="price_desc">{t.catalog.priceHighLow}</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {figures.map(figure => (
                <motion.div key={figure.id} variants={itemVariants} layoutId={figure.id}>
                  <Link
                    href={`/catalog/${figure.id}`}
                    className="group block bg-uiBase rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(225,6,44,0.2)] h-full flex flex-col"
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-900">
                      {figure.images[0] ? (
                        <img
                          src={figure.images[0].url}
                          alt={figure.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-white/20">
                           {t.catalog.noImage}
                         </div>
                      )}
                      
                      {/* Top badge - Release status (clock icon, top right) */}
                      {!figure.isReleased && figure.releaseDate && (
                        <div className="absolute top-3 right-3">
                           <span className="bg-blue-600/90 backdrop-blur-sm text-white p-1.5 rounded shadow-lg">
                             <Clock size={14} />
                           </span>
                        </div>
                      )}

                      {/* Bottom badge - Price */}
                      {figure.priceMXN && (
                        <div className="absolute bottom-3 right-3">
                          <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10">
                            ${figure.priceMXN.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-grow relative">
                      {/* Hover accent line */}
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                      
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          {figure.brand.name}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-white text-base leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {figure.name}
                      </h3>
                      
                      <div className="mt-auto pt-2 border-t border-white/5 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {figure.line.name}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                          <ChevronDown size={14} className="-rotate-90" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => {
                  const query = new URLSearchParams(searchParams.toString())
                  query.set('page', p.toString())
                  const isCurrent = p === page
                  return (
                    <Link
                      key={p}
                      href={`${pathname}?${query.toString()}`}
                      className={`
                        w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all duration-200
                        ${isCurrent
                          ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-110'
                          : 'bg-uiBase text-gray-400 hover:bg-white/10 hover:text-white'
                        }
                      `}
                    >
                      {p}
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}