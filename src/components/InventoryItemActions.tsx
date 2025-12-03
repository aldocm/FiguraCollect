'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserFigure {
  id: string
  status: string
  userPrice: number | null
  preorderMonth: string | null
}

interface Props {
  item: UserFigure
}

export function InventoryItemActions({ item }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    try {
      await fetch(`/api/inventory/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm('¿Seguro que quieres quitar esta figura de tu inventario?')) return

    setLoading(true)
    try {
      await fetch(`/api/inventory/${item.id}`, { method: 'DELETE' })
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      {item.status === 'PREORDER' && (
        <button
          onClick={() => handleStatusChange('OWNED')}
          disabled={loading}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Marcar Recibida
        </button>
      )}

      {item.status === 'WISHLIST' && (
        <button
          onClick={() => handleStatusChange('PREORDER')}
          disabled={loading}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Preordenar
        </button>
      )}

      <button
        onClick={handleRemove}
        disabled={loading}
        className="text-red-600 hover:underline disabled:opacity-50"
      >
        Quitar
      </button>
    </div>
  )
}
