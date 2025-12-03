'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { InputBase, TextAreaBase } from '@/components/ui'

export default function NewListPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al crear lista')
        return
      }

      router.push(`/lists/${data.list.id}`)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="flex items-center justify-center min-h-full bg-background text-textWhite p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="w-full max-w-md p-8 space-y-6 rounded-lg shadow-lg bg-uiBase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <motion.h1
          className="text-3xl font-title text-center text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Crear Nueva Lista
        </motion.h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              className="bg-primary/20 text-primary p-3 rounded-md text-sm text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <InputBase
            type="text"
            label="Nombre *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <TextAreaBase
            label="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-textWhite py-3 rounded-md hover:bg-primary/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-body text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Creando...' : 'Crear Lista'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}
