'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  listId: string
  isFeatured: boolean
  canSetFeatured: boolean
}

export function ListActions({ listId, isFeatured, canSetFeatured }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggleFeatured = async () => {
    setLoading(true)
    try {
      await fetch(`/api/lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !isFeatured })
      })
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Seguro que quieres eliminar esta lista?')) return

    setLoading(true)
    try {
      await fetch(`/api/lists/${listId}`, { method: 'DELETE' })
      router.push('/lists')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      {canSetFeatured && (
        <button
          onClick={handleToggleFeatured}
          disabled={loading}
          className={`px-3 py-1 rounded text-sm ${
            isFeatured
              ? 'bg-yellow-100 text-yellow-700'
              : 'border hover:border-black'
          } disabled:opacity-50`}
        >
          {isFeatured ? 'Quitar destacado' : 'Destacar'}
        </button>
      )}

      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-3 py-1 rounded text-sm border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Eliminar
      </button>
    </div>
  )
}
