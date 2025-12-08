'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clapperboard } from 'lucide-react'
import type { Series } from '../types'

interface NewSeriesModalProps {
  isOpen: boolean
  onClose: () => void
  onSeriesCreated: (series: Series) => void
}

export function NewSeriesModal({
  isOpen,
  onClose,
  onSeriesCreated
}: NewSeriesModalProps) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      if (res.ok) {
        const data = await res.json()
        onSeriesCreated(data.series)
        onClose()
        setName('')
      }
    } catch (e) {
      console.error('Error creating series', e)
    } finally {
      setSaving(false)
    }
  }, [name, onSeriesCreated, onClose])

  const handleClose = useCallback(() => {
    onClose()
    setName('')
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                  <Clapperboard size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">Nueva Serie</h2>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Nombre *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 transition-all"
                  placeholder="Ej. Dragon Ball, Naruto..."
                  autoFocus
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!name.trim() || saving}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
