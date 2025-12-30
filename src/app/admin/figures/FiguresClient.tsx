'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, CheckCircle, Clock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

import { useFiguresData, useFigureForm } from './hooks'
import {
  FigureForm,
  FigureCatalogItem,
  PendingFigureItem,
  ViewModeTabs,
  NewCharacterModal,
  NewSeriesModal
} from './components'
import type { ViewMode, Character, Series } from './types'

export default function FiguresClient() {
  // Ref for form scroll
  const formRef = useRef<HTMLDivElement>(null)

  // Data hook
  const {
    figures,
    brands,
    lines,
    seriesList,
    tags,
    characters,
    loading,
    loadingFigures,
    pagination,
    searchTerm,
    isSearching,
    setFigures,
    setCharacters,
    setSeriesList,
    setPage,
    setSearchTerm,
    refetch
  } = useFiguresData()

  // Form hook
  const {
    form,
    setForm,
    editingId,
    loadingEdit,
    dimensionUnit,
    setDimensionUnit,
    saving,
    error,
    filteredLines,
    handleEdit,
    handleCancelEdit,
    handleSubmit,
    toggleTag,
    toggleSeries
  } = useFigureForm(lines)

  // Local state
  const [showNewCharacterModal, setShowNewCharacterModal] = useState(false)
  const [showNewSeriesModal, setShowNewSeriesModal] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('catalog')
  const [pendingViewSnapshot, setPendingViewSnapshot] = useState<string[]>([])

  // Memoized values
  const pendingViewFigures = useMemo(
    () => figures
      .filter(f => pendingViewSnapshot.includes(f.id))
      .sort((a, b) => {
        // Sort by releaseYear, then releaseMonth, then releaseDay
        if (!a.releaseYear && !b.releaseYear) return 0
        if (!a.releaseYear) return 1
        if (!b.releaseYear) return -1
        if (a.releaseYear !== b.releaseYear) return a.releaseYear - b.releaseYear
        const aMonth = a.releaseMonth || 0
        const bMonth = b.releaseMonth || 0
        if (aMonth !== bMonth) return aMonth - bMonth
        const aDay = a.releaseDay || 0
        const bDay = b.releaseDay || 0
        return aDay - bDay
      }),
    [figures, pendingViewSnapshot]
  )

  const truePendingCount = useMemo(
    () => figures.filter(f => !f.isReleased).length,
    [figures]
  )

  // Handlers
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    if (mode === 'pending') {
      const currentPendingIds = figures.filter(f => !f.isReleased).map(f => f.id)
      setPendingViewSnapshot(currentPendingIds)
    }
    setViewMode(mode)
  }, [figures])

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    handleSubmit(e, refetch)
  }, [handleSubmit, refetch])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('¿Eliminar esta figura?')) return
    setFigures(prev => prev.filter(f => f.id !== id))
    await fetch(`/api/figures/${id}`, { method: 'DELETE' })
    refetch()
  }, [setFigures, refetch])

  const handleToggleReleased = useCallback(async (id: string, newValue: boolean) => {
    try {
      const res = await fetch(`/api/figures/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isReleased: newValue })
      })

      if (res.ok) {
        setFigures(prev => prev.map(f =>
          f.id === id ? { ...f, isReleased: newValue } : f
        ))
      }
    } catch (e) {
      console.error("Error al cambiar estado de lanzamiento", e)
    }
  }, [setFigures])

  const handleCharacterCreated = useCallback((character: Character) => {
    setCharacters(prev => [...prev, character])
    setForm(f => ({ ...f, characterId: character.id }))
  }, [setCharacters, setForm])

  const handleSeriesCreated = useCallback((series: Series) => {
    setSeriesList(prev => [...prev, series])
    setForm(f => ({ ...f, seriesIds: [series.id] }))
  }, [setSeriesList, setForm])

  const handleToggleDimensionUnit = useCallback(() => {
    setDimensionUnit(u => u === 'cm' ? 'in' : 'cm')
  }, [setDimensionUnit])

  // Handle edit with scroll to form
  const handleEditWithScroll = useCallback(async (id: string) => {
    await handleEdit(id)
    // Scroll to form after loading
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [handleEdit])

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
          {/* Left Column: Form */}
          <div ref={formRef} className="xl:col-span-5 h-fit sticky top-8">
          <FigureForm
            form={form}
            setForm={setForm}
            editingId={editingId}
            loadingEdit={loadingEdit}
            dimensionUnit={dimensionUnit}
            onToggleDimensionUnit={handleToggleDimensionUnit}
            saving={saving}
            error={error}
            filteredLines={filteredLines}
            brands={brands}
            seriesList={seriesList}
            tags={tags}
            characters={characters}
            onSubmit={handleFormSubmit}
            onCancelEdit={handleCancelEdit}
            onToggleTag={toggleTag}
            onToggleSeries={toggleSeries}
            onShowNewCharacterModal={() => setShowNewCharacterModal(true)}
            onShowNewSeriesModal={() => setShowNewSeriesModal(true)}
          />
          </div>

          {/* Right Column: List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-7"
          >
            {/* View Mode Tabs */}
            <ViewModeTabs
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              totalCount={pagination.total}
              pendingCount={truePendingCount}
            />

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
                ) : figures.length === 0 ? (
                  <div className="text-center py-12 bg-uiBase/20 rounded-3xl border border-white/5 border-dashed">
                    <p className="text-gray-500">No se encontraron figuras.</p>
                  </div>
                ) : (
                  <>
                    {/* Loading overlay for page changes or searching */}
                    {(loadingFigures || isSearching) && (
                      <div className="flex items-center justify-center py-8">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="w-8 h-8 text-primary" />
                        </motion.div>
                        {isSearching && (
                          <span className="ml-3 text-gray-400 text-sm">Buscando...</span>
                        )}
                      </div>
                    )}

                    {!loadingFigures && !isSearching && (
                      <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                          {figures.map(figure => (
                            <FigureCatalogItem
                              key={figure.id}
                              figure={figure}
                              isEditing={editingId === figure.id}
                              onEdit={handleEditWithScroll}
                              onDelete={handleDelete}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Pagination Controls */}
                    {pagination.pages > 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-white/10"
                      >
                        {/* Previous Button */}
                        <button
                          onClick={() => setPage(pagination.page - 1)}
                          disabled={pagination.page === 1 || loadingFigures}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft size={20} />
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                            .filter(page => {
                              // Show first, last, current, and pages around current
                              const current = pagination.page
                              return page === 1 ||
                                     page === pagination.pages ||
                                     Math.abs(page - current) <= 1
                            })
                            .map((page, index, arr) => {
                              // Add ellipsis if there's a gap
                              const showEllipsisBefore = index > 0 && page - arr[index - 1] > 1
                              return (
                                <div key={page} className="flex items-center">
                                  {showEllipsisBefore && (
                                    <span className="px-2 text-gray-500">...</span>
                                  )}
                                  <button
                                    onClick={() => setPage(page)}
                                    disabled={loadingFigures}
                                    className={`min-w-[40px] h-10 rounded-xl font-bold transition-all ${
                                      page === pagination.page
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10'
                                    } disabled:cursor-not-allowed`}
                                  >
                                    {page}
                                  </button>
                                </div>
                              )
                            })}
                        </div>

                        {/* Next Button */}
                        <button
                          onClick={() => setPage(pagination.page + 1)}
                          disabled={pagination.page === pagination.pages || loadingFigures}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronRight size={20} />
                        </button>

                        {/* Page Info */}
                        <span className="ml-4 text-sm text-gray-500">
                          {pagination.total} figuras
                        </span>
                      </motion.div>
                    )}
                  </>
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
                    <AnimatePresence mode="popLayout">
                      {pendingViewFigures.map(figure => (
                        <PendingFigureItem
                          key={figure.id}
                          figure={figure}
                          onToggleReleased={handleToggleReleased}
                          onEdit={handleEditWithScroll}
                        />
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
      <NewCharacterModal
        isOpen={showNewCharacterModal}
        onClose={() => setShowNewCharacterModal(false)}
        seriesList={seriesList}
        onCharacterCreated={handleCharacterCreated}
      />

      {/* New Series Modal */}
      <NewSeriesModal
        isOpen={showNewSeriesModal}
        onClose={() => setShowNewSeriesModal(false)}
        onSeriesCreated={handleSeriesCreated}
      />
    </div>
  )
}
