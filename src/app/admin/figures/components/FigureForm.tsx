'use client'

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, X, Save, Image as ImageIcon, DollarSign, Ruler, Tag,
  ChevronDown, ArrowLeftRight, User
} from 'lucide-react'
import type { MeasureUnit } from '@/lib/utils'
import type { FigureFormData, Brand, Line, Series, TagType, Character } from '../types'

interface FigureFormProps {
  form: FigureFormData
  setForm: React.Dispatch<React.SetStateAction<FigureFormData>>
  editingId: string | null
  dimensionUnit: MeasureUnit
  onToggleDimensionUnit: () => void
  saving: boolean
  error: string
  filteredLines: Line[]
  brands: Brand[]
  seriesList: Series[]
  tags: TagType[]
  characters: Character[]
  onSubmit: (e: React.FormEvent) => void
  onCancelEdit: () => void
  onToggleTag: (tagId: string) => void
  onToggleSeries: (seriesId: string) => void
  onShowNewCharacterModal: () => void
  onShowNewSeriesModal: () => void
}

export const FigureForm = memo(function FigureForm({
  form,
  setForm,
  editingId,
  dimensionUnit,
  onToggleDimensionUnit,
  saving,
  error,
  filteredLines,
  brands,
  seriesList,
  tags,
  characters,
  onSubmit,
  onCancelEdit,
  onToggleTag,
  onToggleSeries,
  onShowNewCharacterModal,
  onShowNewSeriesModal
}: FigureFormProps) {
  // Sort all lists alphabetically
  const sortedBrands = useMemo(() =>
    [...brands].sort((a, b) => a.name.localeCompare(b.name)), [brands])
  const sortedLines = useMemo(() =>
    [...filteredLines].sort((a, b) => a.name.localeCompare(b.name)), [filteredLines])
  const sortedSeries = useMemo(() =>
    [...seriesList].sort((a, b) => a.name.localeCompare(b.name)), [seriesList])
  const sortedCharacters = useMemo(() =>
    [...characters].sort((a, b) => a.name.localeCompare(b.name)), [characters])
  const sortedTags = useMemo(() =>
    [...tags].sort((a, b) => a.name.localeCompare(b.name)), [tags])

  return (
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
            <h2 className="text-base md:text-lg font-bold text-white">
              {editingId ? 'Editar Figura' : 'Nueva Figura'}
            </h2>
          </div>
          {editingId && (
            <button
              onClick={onCancelEdit}
              className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-4 md:space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-2 md:p-3 rounded-xl text-xs md:text-sm flex items-center gap-2">
              <X size={16} /> {error}
            </div>
          )}

          {/* Basic Info */}
          <BasicInfoSection
            form={form}
            setForm={setForm}
            brands={sortedBrands}
            filteredLines={sortedLines}
            characters={sortedCharacters}
            seriesList={sortedSeries}
            onShowNewCharacterModal={onShowNewCharacterModal}
            onShowNewSeriesModal={onShowNewSeriesModal}
            onToggleSeries={onToggleSeries}
          />

          {/* Prices & Dates */}
          <PricesSection form={form} setForm={setForm} />

          {/* Specs */}
          <SpecsSection
            form={form}
            setForm={setForm}
            dimensionUnit={dimensionUnit}
            onToggleDimensionUnit={onToggleDimensionUnit}
          />

          {/* Images */}
          <ImagesSection form={form} setForm={setForm} />

          {/* Tags */}
          <TaxonomySection
            form={form}
            tags={sortedTags}
            onToggleTag={onToggleTag}
          />

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
  )
})

// --- Sub-sections ---

function BasicInfoSection({
  form,
  setForm,
  brands,
  filteredLines,
  characters,
  seriesList,
  onShowNewCharacterModal,
  onShowNewSeriesModal,
  onToggleSeries
}: {
  form: FigureFormData
  setForm: React.Dispatch<React.SetStateAction<FigureFormData>>
  brands: Brand[]
  filteredLines: Line[]
  characters: Character[]
  seriesList: Series[]
  onShowNewCharacterModal: () => void
  onShowNewSeriesModal: () => void
  onToggleSeries: (seriesId: string) => void
}) {
  return (
    <div className="space-y-3 md:space-y-4">
      <h3 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2">
        Información Básica
      </h3>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="col-span-2">
          <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">
            Nombre *
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2 text-sm md:text-base text-white focus:border-primary transition-all"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">
            Descripción
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2 text-sm md:text-base text-white focus:border-primary transition-all resize-none"
            placeholder="Descripción de la figura..."
          />
        </div>
        <div>
          <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">
            Marca *
          </label>
          <div className="relative">
            <select
              value={form.brandId}
              onChange={(e) => setForm({ ...form, brandId: e.target.value, lineId: '' })}
              className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2 text-sm md:text-base text-white focus:border-primary transition-all [&>option]:bg-gray-900 [&>option]:text-white"
              required
            >
              <option value="">Selecciona</option>
              {[...brands].sort((a, b) => a.name.localeCompare(b.name)).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">
            Línea *
          </label>
          <div className="relative">
            <select
              value={form.lineId}
              onChange={(e) => setForm({ ...form, lineId: e.target.value })}
              className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2 text-sm md:text-base text-white focus:border-primary transition-all disabled:opacity-50 [&>option]:bg-gray-900 [&>option]:text-white"
              required
              disabled={!form.brandId}
            >
              <option value="">Selecciona</option>
              {[...filteredLines].sort((a, b) => a.name.localeCompare(b.name)).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
        <div className="col-span-2">
          <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">
            Serie (opcional)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={form.seriesIds[0] || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    onToggleSeries(e.target.value)
                  } else {
                    setForm({ ...form, seriesIds: [] })
                  }
                }}
                className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2 text-sm md:text-base text-white focus:border-primary transition-all [&>option]:bg-gray-900 [&>option]:text-white"
              >
                <option value="">Sin serie</option>
                {[...seriesList].sort((a, b) => a.name.localeCompare(b.name)).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            <button
              type="button"
              onClick={onShowNewSeriesModal}
              className="px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400 hover:bg-purple-600/30 transition-colors"
              title="Crear nueva serie"
            >
              <Plus size={16} />
            </button>
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
                className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-3 md:px-4 py-2 text-sm md:text-base text-white focus:border-primary transition-all [&>option]:bg-gray-900 [&>option]:text-white"
              >
                <option value="">Sin personaje</option>
                {[...characters].sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.series ? ` (${c.series.name})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            <button
              type="button"
              onClick={onShowNewCharacterModal}
              className="px-3 py-2 bg-cyan-600/20 border border-cyan-500/30 rounded-xl text-cyan-400 hover:bg-cyan-600/30 transition-colors"
              title="Crear nuevo personaje"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PricesSection({
  form,
  setForm
}: {
  form: FigureFormData
  setForm: React.Dispatch<React.SetStateAction<FigureFormData>>
}) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 2010 + 6 }, (_, i) => 2010 + i)
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
    <div className="space-y-3 md:space-y-4">
      <h3 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
        <DollarSign size={14} /> Precios y Fechas
      </h3>
      <p className="text-[10px] md:text-xs text-gray-400">Selecciona el precio original (base) de la figura:</p>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {(['MXN', 'USD', 'YEN'] as const).map((currency) => (
          <div key={currency} className="flex flex-col gap-1.5 md:gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">{currency}</label>
              <input
                type="radio"
                name="originalCurrency"
                checked={form.originalPriceCurrency === currency}
                onChange={() => setForm({ ...form, originalPriceCurrency: currency })}
                className="accent-primary w-3 h-3"
              />
            </div>
            <input
              type="number"
              placeholder={currency === 'YEN' ? '0' : '0.00'}
              value={form[`price${currency}` as keyof FigureFormData] as string}
              onChange={e => setForm({ ...form, [`price${currency}`]: e.target.value })}
              className="bg-black/40 border border-white/10 rounded-xl px-2 md:px-3 py-2 text-white text-xs md:text-sm w-full"
            />
          </div>
        ))}
      </div>

      <div className="pt-2">
        <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">
          Fecha de Lanzamiento
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div className="relative">
            <select
              value={form.releaseYear}
              onChange={e => setForm({ ...form, releaseYear: e.target.value })}
              className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-2 md:px-3 py-2 text-white text-xs md:text-sm focus:border-primary transition-all [&>option]:bg-gray-900 [&>option]:text-white"
            >
              <option value="">Año</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={form.releaseMonth}
              onChange={e => setForm({ ...form, releaseMonth: e.target.value })}
              className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-2 md:px-3 py-2 text-white text-xs md:text-sm focus:border-primary transition-all [&>option]:bg-gray-900 [&>option]:text-white"
            >
              <option value="">Mes</option>
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          <input
            type="number"
            min="1"
            max="31"
            placeholder="Día (opc.)"
            value={form.releaseDay}
            onChange={e => setForm({ ...form, releaseDay: e.target.value })}
            className="bg-black/40 border border-white/10 rounded-xl px-2 md:px-3 py-2 text-white text-xs md:text-sm w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <label className="flex items-center gap-2 text-xs md:text-sm text-gray-300 cursor-pointer bg-black/20 rounded-xl px-3 py-2 border border-white/5">
          <input
            type="checkbox"
            checked={form.isReleased}
            onChange={e => setForm({ ...form, isReleased: e.target.checked })}
            className="accent-primary w-4 h-4"
          />
          Ya lanzada
        </label>
        <label className="flex items-center gap-2 text-xs md:text-sm text-gray-300 cursor-pointer bg-black/20 rounded-xl px-3 py-2 border border-white/5">
          <input
            type="checkbox"
            checked={form.isNSFW}
            onChange={e => setForm({ ...form, isNSFW: e.target.checked })}
            className="accent-red-500 w-4 h-4"
          />
          NSFW
        </label>
      </div>
    </div>
  )
}

function SpecsSection({
  form,
  setForm,
  dimensionUnit,
  onToggleDimensionUnit
}: {
  form: FigureFormData
  setForm: React.Dispatch<React.SetStateAction<FigureFormData>>
  dimensionUnit: MeasureUnit
  onToggleDimensionUnit: () => void
}) {
  return (
    <div className="space-y-3 md:space-y-4">
      <h3 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
        <Ruler size={14} /> Especificaciones
      </h3>

      {/* Dimensions with unit toggle */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Dimensiones</label>
          <button
            type="button"
            onClick={onToggleDimensionUnit}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeftRight size={10} />
            {dimensionUnit === 'cm' ? 'Centímetros' : 'Pulgadas'}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 ml-1">Altura ({dimensionUnit})</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.heightCm}
              onChange={e => setForm({ ...form, heightCm: e.target.value })}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 ml-1">Ancho ({dimensionUnit})</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.widthCm}
              onChange={e => setForm({ ...form, widthCm: e.target.value })}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 ml-1">Profund. ({dimensionUnit})</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.depthCm}
              onChange={e => setForm({ ...form, depthCm: e.target.value })}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Escala</label>
          <input
            placeholder="e.g. 1/12"
            value={form.scale}
            onChange={e => setForm({ ...form, scale: e.target.value })}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Material</label>
          <input
            placeholder="PVC, ABS"
            value={form.material}
            onChange={e => setForm({ ...form, material: e.target.value })}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">SKU / Código</label>
          <input
            placeholder="ABCD-1234"
            value={form.sku}
            onChange={e => setForm({ ...form, sku: e.target.value })}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Fabricante</label>
          <input
            placeholder="e.g. Tamashii Nations"
            value={form.maker}
            onChange={e => setForm({ ...form, maker: e.target.value })}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full"
          />
        </div>
      </div>
    </div>
  )
}

function ImagesSection({
  form,
  setForm
}: {
  form: FigureFormData
  setForm: React.Dispatch<React.SetStateAction<FigureFormData>>
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
        <ImageIcon size={14} /> Imágenes
      </h3>
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">
          URLs (Una por línea)
        </label>
        <textarea
          value={form.images}
          onChange={(e) => setForm({ ...form, images: e.target.value })}
          rows={3}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none"
          placeholder="https://..."
        />
      </div>
    </div>
  )
}

function TaxonomySection({
  form,
  tags,
  onToggleTag
}: {
  form: FigureFormData
  tags: TagType[]
  onToggleTag: (tagId: string) => void
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
        <Tag size={14} /> Tags
      </h3>

      <div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1 border border-white/5 rounded-xl bg-black/20">
          {[...tags].sort((a, b) => a.name.localeCompare(b.name)).map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => onToggleTag(t.id)}
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
  )
}
