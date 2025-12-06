'use client'

import { memo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Box, Edit2, ExternalLink, Trash2 } from 'lucide-react'
import type { Figure } from '../types'

interface FigureCatalogItemProps {
  figure: Figure
  isEditing: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export const FigureCatalogItem = memo(function FigureCatalogItem({
  figure,
  isEditing,
  onEdit,
  onDelete
}: FigureCatalogItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`group flex items-center gap-4 bg-uiBase/40 backdrop-blur-md border rounded-2xl p-4 transition-all ${
        isEditing
          ? 'border-primary/50 ring-1 ring-primary/50 bg-primary/5'
          : 'border-white/5 hover:bg-uiBase/60 hover:border-white/20'
      }`}
    >
      {/* Image Thumbnail */}
      <div className="w-16 h-16 rounded-xl bg-black/50 flex-shrink-0 overflow-hidden border border-white/10">
        {figure.images[0] ? (
          <img
            src={figure.images[0].url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700">
            <Box size={20} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-grow min-w-0">
        <h3 className="font-bold text-white truncate">{figure.name}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="text-primary">{figure.brand.name}</span>
          <span>•</span>
          <span>{figure.line.name}</span>
          {figure.releaseDate && (
            <>
              <span>•</span>
              <span>{figure.releaseDate}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(figure.id)}
          className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Editar"
        >
          <Edit2 size={18} />
        </button>
        <Link
          href={`/catalog/${figure.id}`}
          target="_blank"
          className="p-2 rounded-lg bg-white/5 text-blue-400 hover:bg-blue-500/20 transition-colors"
        >
          <ExternalLink size={18} />
        </Link>
        <button
          onClick={() => onDelete(figure.id)}
          className="p-2 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  )
})
