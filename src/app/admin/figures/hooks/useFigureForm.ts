'use client'

import { useState, useCallback, useMemo } from 'react'
import { inchesToCm } from '@/lib/utils'
import type { MeasureUnit } from '@/lib/utils'
import { INITIAL_FORM_DATA, type FigureFormData, type Line } from '../types'

interface FigureImage { url: string }
interface FigureTag { tag: { id: string } }
interface FigureSeries { series: { id: string } }

interface FigureDetail {
  name: string
  description: string | null
  sku: string | null
  heightCm: number | null
  widthCm: number | null
  depthCm: number | null
  scale: string | null
  material: string | null
  maker: string | null
  priceMXN: number | null
  priceUSD: number | null
  priceYEN: number | null
  originalPriceCurrency: string | null
  releaseYear: number | null
  releaseMonth: number | null
  releaseDay: number | null
  isReleased: boolean
  isNSFW: boolean
  brand: { id: string }
  line: { id: string }
  character?: { id: string } | null
  images: FigureImage[]
  tags: FigureTag[]
  series: FigureSeries[]
}

interface UseFigureFormReturn {
  form: FigureFormData
  setForm: React.Dispatch<React.SetStateAction<FigureFormData>>
  editingId: string | null
  dimensionUnit: MeasureUnit
  setDimensionUnit: React.Dispatch<React.SetStateAction<MeasureUnit>>
  saving: boolean
  error: string
  setError: React.Dispatch<React.SetStateAction<string>>
  filteredLines: Line[]
  handleEdit: (id: string) => Promise<void>
  handleCancelEdit: () => void
  handleSubmit: (e: React.FormEvent, onSuccess: () => void) => Promise<void>
  toggleTag: (tagId: string) => void
  toggleSeries: (seriesId: string) => void
  toCm: (value: string) => number | null
}

export function useFigureForm(lines: Line[]): UseFigureFormReturn {
  const [form, setForm] = useState<FigureFormData>(INITIAL_FORM_DATA)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dimensionUnit, setDimensionUnit] = useState<MeasureUnit>('cm')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const filteredLines = useMemo(
    () => lines.filter(l => l.brandId === form.brandId),
    [lines, form.brandId]
  )

  const toCm = useCallback((value: string): number | null => {
    if (!value) return null
    const num = parseFloat(value)
    if (isNaN(num)) return null
    return dimensionUnit === 'in' ? inchesToCm(num) : num
  }, [dimensionUnit])

  const handleEdit = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/figures/${id}`)
      if (res.ok) {
        const data = await res.json()
        const f: FigureDetail = data.figure

        setEditingId(id)
        setDimensionUnit('cm')
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
          originalPriceCurrency: (f.originalPriceCurrency as 'MXN' | 'USD' | 'YEN') || 'YEN',
          releaseYear: f.releaseYear ? f.releaseYear.toString() : '',
          releaseMonth: f.releaseMonth ? f.releaseMonth.toString() : '',
          releaseDay: f.releaseDay ? f.releaseDay.toString() : '',
          isReleased: f.isReleased,
          isNSFW: f.isNSFW,
          brandId: f.brand.id,
          lineId: f.line.id,
          characterId: f.character?.id || '',
          images: f.images.map((img) => img.url).join('\n'),
          tagIds: f.tags.map((t) => t.tag.id),
          seriesIds: f.series.map((s) => s.series.id)
        })
        setError('')
      }
    } catch (e) {
      console.error("Failed to fetch figure details", e)
    }
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setDimensionUnit('cm')
    setForm(INITIAL_FORM_DATA)
    setError('')
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent, onSuccess: () => void) => {
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
          releaseYear: form.releaseYear || null,
          releaseMonth: form.releaseMonth || null,
          releaseDay: form.releaseDay || null,
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
      onSuccess()
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }, [form, editingId, toCm, handleCancelEdit])

  const toggleTag = useCallback((tagId: string) => {
    setForm(f => ({
      ...f,
      tagIds: f.tagIds.includes(tagId)
        ? f.tagIds.filter(id => id !== tagId)
        : [...f.tagIds, tagId]
    }))
  }, [])

  const toggleSeries = useCallback((seriesId: string) => {
    setForm(f => ({
      ...f,
      seriesIds: f.seriesIds.includes(seriesId)
        ? f.seriesIds.filter(id => id !== seriesId)
        : [...f.seriesIds, seriesId]
    }))
  }, [])

  return {
    form,
    setForm,
    editingId,
    dimensionUnit,
    setDimensionUnit,
    saving,
    error,
    setError,
    filteredLines,
    handleEdit,
    handleCancelEdit,
    handleSubmit,
    toggleTag,
    toggleSeries,
    toCm
  }
}
