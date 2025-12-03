'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  figureId: string
  currentStatus: string | null
  userFigureId: string | null
}

export function AddToInventoryButton({ figureId, currentStatus, userFigureId }: Props) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const router = useRouter()

  const handleAdd = async (newStatus: string) => {
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

  const statuses = [
    { key: 'WISHLIST', label: 'Wishlist', color: 'bg-yellow-500' },
    { key: 'PREORDER', label: 'Preorder', color: 'bg-blue-500' },
    { key: 'OWNED', label: 'Owned', color: 'bg-green-500' }
  ]

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">
        {status ? `En tu colección: ${status}` : 'Agregar a tu colección'}
      </p>

      <div className="flex flex-wrap gap-2">
        {statuses.map(s => (
          <button
            key={s.key}
            onClick={() => handleAdd(s.key)}
            disabled={loading}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              status === s.key
                ? `${s.color} text-white`
                : 'border hover:border-black'
            } disabled:opacity-50`}
          >
            {s.label}
          </button>
        ))}

        {status && (
          <button
            onClick={handleRemove}
            disabled={loading}
            className="px-3 py-1 rounded text-sm border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Quitar
          </button>
        )}
      </div>
    </div>
  )
}
