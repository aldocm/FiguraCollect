'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Settings, Eye, EyeOff, Save, RefreshCw } from 'lucide-react'

export default function SettingsClient() {
  const [showPendingFigures, setShowPendingFigures] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/system-config?key=SHOW_PENDING_FIGURES')
      if (res.ok) {
        const data = await res.json()
        setShowPendingFigures(data.config?.value === true)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/system-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'SHOW_PENDING_FIGURES',
          value: showPendingFigures
        })
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Configuración guardada exitosamente' })
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Error al guardar' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0a0a1a] to-black p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link
            href="/admin"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="text-purple-400" />
              Configuración del Sistema
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Solo visible para SUPERADMIN
            </p>
          </div>
        </motion.div>

        {/* Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={32} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Show Pending Figures Toggle */}
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  {showPendingFigures ? (
                    <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
                      <Eye size={24} />
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-gray-500/20 text-gray-400">
                      <EyeOff size={24} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white">Mostrar figuras pendientes</h3>
                    <p className="text-sm text-gray-400">
                      Si está activado, las figuras creadas por usuarios (pendientes de aprobación)
                      serán visibles en el catálogo público.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPendingFigures(!showPendingFigures)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    showPendingFigures ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      showPendingFigures ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-300">
                  <strong>Nota:</strong> Cuando esta opción está desactivada, solo las figuras
                  aprobadas por un administrador serán visibles en el catálogo público.
                  Los usuarios podrán seguir creando figuras, pero estas quedarán pendientes
                  de aprobación.
                </p>
              </div>

              {/* Message */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl ${
                    message.type === 'success'
                      ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                      : 'bg-red-500/20 border border-red-500/30 text-red-300'
                  }`}
                >
                  {message.text}
                </motion.div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Guardar Configuración
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
