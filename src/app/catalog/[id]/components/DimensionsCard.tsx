'use client'

import { Ruler, ArrowLeftRight } from 'lucide-react'
import type { MeasureUnit } from '@/lib/utils'

interface DimensionsCardProps {
  heightCm: number | null
  widthCm: number | null
  depthCm: number | null
  measureUnit: MeasureUnit
  onToggleUnit: () => void
}

export function DimensionsCard({
  heightCm,
  widthCm,
  depthCm,
  measureUnit,
  onToggleUnit
}: DimensionsCardProps) {
  if (!heightCm && !widthCm && !depthCm) return null

  const cmToIn = (cm: number) => (cm * 0.393701).toFixed(2)
  const onlyHeight = heightCm && !widthCm && !depthCm

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 lg:p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2 lg:mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 lg:p-2 rounded-full bg-primary/20 text-primary">
            <Ruler size={16} />
          </div>
          <p className="text-[10px] lg:text-xs text-gray-400 uppercase font-bold tracking-wider">
            {onlyHeight ? 'Tamaño' : 'Dimensiones'}
          </p>
        </div>
        <button
          onClick={onToggleUnit}
          className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          title="Cambiar unidad de medida"
        >
          <ArrowLeftRight size={12} />
          {measureUnit === 'cm' ? 'cm' : 'in'}
        </button>
      </div>

      {onlyHeight ? (
        <div className="bg-black/20 rounded-lg p-3 lg:p-4 text-center">
          <p className="text-[10px] text-gray-500 uppercase mb-1">Altura</p>
          <p className="text-xl lg:text-2xl text-white font-bold">
            {measureUnit === 'cm' ? heightCm : cmToIn(heightCm!)}
            <span className="text-sm lg:text-base text-gray-400 font-normal ml-1">
              {measureUnit}
            </span>
          </p>
        </div>
      ) : (
        <DimensionsGrid
          heightCm={heightCm}
          widthCm={widthCm}
          depthCm={depthCm}
          measureUnit={measureUnit}
          cmToIn={cmToIn}
        />
      )}
    </div>
  )
}

function DimensionsGrid({
  heightCm,
  widthCm,
  depthCm,
  measureUnit,
  cmToIn
}: {
  heightCm: number | null
  widthCm: number | null
  depthCm: number | null
  measureUnit: MeasureUnit
  cmToIn: (cm: number) => string
}) {
  const dimCount = [heightCm, widthCm, depthCm].filter(Boolean).length
  const gridCols = dimCount === 2 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div className={`grid ${gridCols} gap-2 text-center`}>
      {heightCm && (
        <DimensionItem
          label="Alto"
          value={heightCm}
          measureUnit={measureUnit}
          cmToIn={cmToIn}
        />
      )}
      {widthCm && (
        <DimensionItem
          label="Ancho"
          value={widthCm}
          measureUnit={measureUnit}
          cmToIn={cmToIn}
        />
      )}
      {depthCm && (
        <DimensionItem
          label="Prof."
          value={depthCm}
          measureUnit={measureUnit}
          cmToIn={cmToIn}
        />
      )}
    </div>
  )
}

function DimensionItem({
  label,
  value,
  measureUnit,
  cmToIn
}: {
  label: string
  value: number
  measureUnit: MeasureUnit
  cmToIn: (cm: number) => string
}) {
  return (
    <div className="bg-black/20 rounded-lg p-2 lg:p-3">
      <p className="text-[10px] text-gray-500 uppercase">{label}</p>
      <p className="text-base lg:text-lg text-white font-bold">
        {measureUnit === 'cm' ? value : cmToIn(value)}
        <span className="text-xs text-gray-400 font-normal ml-1">{measureUnit}</span>
      </p>
    </div>
  )
}
