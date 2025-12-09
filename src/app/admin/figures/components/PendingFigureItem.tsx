'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Box, Calendar, CheckCircle, Clock, Edit2, Rocket } from 'lucide-react'
import { formatReleaseDateFromFields } from '@/lib/utils'
import type { Figure } from '../types'

interface PendingFigureItemProps {
  figure: Figure
  onToggleReleased: (id: string, isReleased: boolean) => void
  onEdit: (id: string) => void
}

export const PendingFigureItem = memo(function PendingFigureItem({
  figure,
  onToggleReleased,
  onEdit
}: PendingFigureItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex items-center gap-4 bg-black/30 border rounded-xl p-4 group transition-all ${
        figure.isReleased
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-white/5 hover:border-amber-500/30'
      }`}
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-lg bg-black/50 flex-shrink-0 overflow-hidden border border-white/10">
        {figure.images[0] ? (
          <img
            src={figure.images[0].url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700">
            <Box size={18} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-white truncate">{figure.name}</h4>
          {figure.isReleased && (
            <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="text-amber-400">{figure.brand.name}</span>
          <span>•</span>
          <span>{figure.line.name}</span>
        </div>
        {figure.releaseYear && (
          <div className="flex items-center gap-1 mt-1 text-xs text-amber-400/80">
            <Calendar size={12} />
            <span>{formatReleaseDateFromFields(figure.releaseYear, figure.releaseMonth, figure.releaseDay)}</span>
          </div>
        )}
      </div>

      {/* Toggle Released Button */}
      <button
        onClick={() => onToggleReleased(figure.id, !figure.isReleased)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
          figure.isReleased
            ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400'
            : 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400'
        }`}
        title={figure.isReleased ? 'Volver a pendiente' : 'Marcar como lanzada'}
      >
        {figure.isReleased ? (
          <>
            <Clock size={14} />
            <span>Pendiente</span>
          </>
        ) : (
          <>
            <Rocket size={14} />
            <span>Lanzada</span>
          </>
        )}
      </button>

      {/* Edit Button */}
      <button
        onClick={() => onEdit(figure.id)}
        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        title="Editar"
      >
        <Edit2 size={16} />
      </button>
    </motion.div>
  )
})
