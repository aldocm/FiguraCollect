'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, CheckCircle, Clock } from 'lucide-react'

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
  // Data hook
  const {
    figures,
    brands,
    lines,
    seriesList,
    tags,
    characters,
    loading,
    setFigures,
    setCharacters,
    setSeriesList,
    refetch
  } = useFiguresData()

  // Form hook
  const {
    form,
    setForm,
    editingId,
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
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewCharacterModal, setShowNewCharacterModal] = useState(false)
  const [showNewSeriesModal, setShowNewSeriesModal] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('catalog')
  const [pendingViewSnapshot, setPendingViewSnapshot] = useState<string[]>([])

  // Memoized values
  const filteredFigures = useMemo(
    () => figures.filter(f =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [figures, searchTerm]
  )

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
          <FigureForm
            form={form}
            setForm={setForm}
            editingId={editingId}
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
              totalCount={figures.length}
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
                ) : filteredFigures.length === 0 ? (
                  <div className="text-center py-12 bg-uiBase/20 rounded-3xl border border-white/5 border-dashed">
                    <p className="text-gray-500">No se encontraron figuras.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {filteredFigures.map(figure => (
                        <FigureCatalogItem
                          key={figure.id}
                          figure={figure}
                          isEditing={editingId === figure.id}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
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
                    <AnimatePresence mode="popLayout">
                      {pendingViewFigures.map(figure => (
                        <PendingFigureItem
                          key={figure.id}
                          figure={figure}
                          onToggleReleased={handleToggleReleased}
                          onEdit={handleEdit}
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
