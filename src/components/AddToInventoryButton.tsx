'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Box, CalendarClock, Trash2, Check } from 'lucide-react'

interface Props {
  figureId: string
  currentStatus: string | null
  userFigureId: string | null
  isReleased: boolean
}

export function AddToInventoryButton({ figureId, currentStatus, userFigureId, isReleased }: Props) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const router = useRouter()

  const handleAdd = async (newStatus: string) => {
    if (status === newStatus) return // No hacer nada si ya está en ese estado
    
    setLoading(true)

    try {
      if (status && userFigureId) {
        // Update existing
        await fetch(`/api/inventory/${userFigureId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
      } else {
        // Create new
        await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ figureId, status: newStatus })
        })
      }

      setStatus(newStatus)
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!userFigureId) return
    setLoading(true)

    try {
      await fetch(`/api/inventory/${userFigureId}`, {
        method: 'DELETE'
      })
      setStatus(null)
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Definición de botones
  const wishlistBtn = {
    key: 'WISHLIST',
    label: 'Wishlist',
    icon: Heart,
    activeClass: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
    inactiveClass: 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
  }

  const actionBtn = isReleased
    ? {
        key: 'OWNED',
        label: 'Lo tengo',
        icon: Box,
        activeClass: 'bg-green-500/20 text-green-400 border-green-500/50',
        inactiveClass: 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
      }
    : {
        key: 'PREORDER',
        label: 'Pre-ordenar',
        icon: CalendarClock,
        activeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
        inactiveClass: 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
      }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Botón Wishlist */}
        <button
          onClick={() => handleAdd(wishlistBtn.key)}
          disabled={loading}
          className={`
            relative group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-300
            ${status === wishlistBtn.key ? wishlistBtn.activeClass : wishlistBtn.inactiveClass}
          `}
        >
          <wishlistBtn.icon 
            size={24} 
            className={`transition-transform duration-300 group-hover:scale-110 ${status === wishlistBtn.key ? 'fill-current' : ''}`} 
          />
          <span className="font-bold text-sm uppercase tracking-wider">{wishlistBtn.label}</span>
          {status === wishlistBtn.key && (
            <div className="absolute top-2 right-2 text-pink-400">
              <Check size={14} />
            </div>
          )}
        </button>

        {/* Botón Dinámico (Owned / Preorder) */}
        <button
          onClick={() => handleAdd(actionBtn.key)}
          disabled={loading}
          className={`
            relative group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-300
            ${status === actionBtn.key ? actionBtn.activeClass : actionBtn.inactiveClass}
          `}
        >
          <actionBtn.icon 
            size={24} 
            className={`transition-transform duration-300 group-hover:scale-110 ${status === actionBtn.key ? 'text-current' : ''}`} 
          />
          <span className="font-bold text-sm uppercase tracking-wider">{actionBtn.label}</span>
          {status === actionBtn.key && (
            <div className="absolute top-2 right-2 text-current opacity-80">
              <Check size={14} />
            </div>
          )}
        </button>
      </div>

      {/* Estado actual y opción de eliminar */}
      {status && (
        <div className="flex items-center justify-between px-1 pt-2">
            <p className="text-xs text-gray-500">
                Estado actual: <span className="text-white font-medium">{
                    status === 'WISHLIST' ? 'En Wishlist' : 
                    status === 'PREORDER' ? 'Pre-ordenado' : 'En Colección'
                }</span>
            </p>
            <button
                onClick={handleRemove}
                disabled={loading}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-md hover:bg-red-500/10"
            >
                <Trash2 size={12} />
                Eliminar
            </button>
        </div>
      )}
    </div>
  )
}
