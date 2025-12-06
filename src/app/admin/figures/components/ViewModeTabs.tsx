'use client'

import { memo } from 'react'
import { Box, Clock } from 'lucide-react'
import type { ViewMode } from '../types'

interface ViewModeTabsProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  totalCount: number
  pendingCount: number
}

export const ViewModeTabs = memo(function ViewModeTabs({
  viewMode,
  onViewModeChange,
  totalCount,
  pendingCount
}: ViewModeTabsProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <button
        onClick={() => onViewModeChange('catalog')}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
          viewMode === 'catalog'
            ? 'bg-primary/20 border border-primary/50 text-primary'
            : 'bg-uiBase/30 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
        }`}
      >
        <Box size={16} />
        Catálogo
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">{totalCount}</span>
      </button>
      <button
        onClick={() => onViewModeChange('pending')}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
          viewMode === 'pending'
            ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
            : 'bg-uiBase/30 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
        }`}
      >
        <Clock size={16} />
        Pendientes
        {pendingCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300">
            {pendingCount}
          </span>
        )}
      </button>
    </div>
  )
})
