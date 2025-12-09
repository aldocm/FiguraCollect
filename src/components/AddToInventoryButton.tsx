'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Box, CalendarClock, Check } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

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
  const { t } = useLanguage()

  const handleAdd = async (newStatus: string) => {
    // Si ya está en ese estado, lo quitamos (toggle)
    if (status === newStatus) {
      await handleRemove()
      return
    }
    
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
    // Si no tenemos userFigureId (caso raro si status está set), intentamos limpiar local
    if (!userFigureId && !status) return

    setLoading(true)

    try {
      // Solo llamamos a la API si tenemos un ID real.
      // Si acabamos de crear (sin recargar página) userFigureId podría ser null en props,
      // pero aquí estamos asumiendo que el componente padre se refresca o que manejamos
      // el estado localmente. Para ser seguros, si userFigureId es null pero tenemos status,
      // podría ser una desincronización, pero intentaremos seguir el flujo de UI.
      // NOTA: Para este componente funcionar perfecto sin recarga, el padre debería pasar el nuevo ID.
      // Por ahora confiamos en router.refresh().
      
      if (userFigureId) {
          await fetch(`/api/inventory/${userFigureId}`, {
            method: 'DELETE'
          })
      }
      
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
    label: t.inventory.wishlist,
    icon: Heart,
    activeClass: 'bg-pink-500/20 text-pink-400 border-pink-500/50 hover:bg-pink-500/30',
    inactiveClass: 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
  }

  const actionBtn = isReleased
    ? {
        key: 'OWNED',
        label: t.inventory.owned,
        icon: Box,
        activeClass: 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30',
        inactiveClass: 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
      }
    : {
        key: 'PREORDER',
        label: t.inventory.preorder,
        icon: CalendarClock,
        activeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30',
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
    </div>
  )
}
