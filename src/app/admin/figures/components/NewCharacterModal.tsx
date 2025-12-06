'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, User } from 'lucide-react'
import type { Series, Character } from '../types'

interface NewCharacterModalProps {
  isOpen: boolean
  onClose: () => void
  seriesList: Series[]
  onCharacterCreated: (character: Character) => void
}

export function NewCharacterModal({
  isOpen,
  onClose,
  seriesList,
  onCharacterCreated
}: NewCharacterModalProps) {
  const [name, setName] = useState('')
  const [seriesId, setSeriesId] = useState('')
  const [saving, setSaving] = useState(false)

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          seriesId: seriesId || null
        })
      })
      if (res.ok) {
        const data = await res.json()
        onCharacterCreated(data.character)
        onClose()
        setName('')
        setSeriesId('')
      }
    } catch (e) {
      console.error('Error creating character', e)
    } finally {
      setSaving(false)
    }
  }, [name, seriesId, onCharacterCreated, onClose])

  const handleClose = useCallback(() => {
    onClose()
    setName('')
    setSeriesId('')
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
                <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                  <User size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">Nuevo Personaje</h2>
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
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 transition-all"
                  placeholder="Ej. Goku, Naruto..."
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Serie (opcional)</label>
                <div className="relative">
                  <select
                    value={seriesId}
                    onChange={e => setSeriesId(e.target.value)}
                    className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 transition-all"
                  >
                    <option value="" className="bg-gray-900">Sin serie</option>
                    {seriesList.map(s => (
                      <option key={s.id} value={s.id} className="bg-gray-900">{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
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
                  className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
