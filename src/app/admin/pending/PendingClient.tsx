'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, Clock, Check, X, Package, Building2,
  Layers, Film, Users, RefreshCw, AlertCircle
} from 'lucide-react'

type ContentType = 'figures' | 'brands' | 'lines' | 'series' | 'characters'

interface Counts {
  figures: number
  brands: number
  lines: number
  series: number
  characters: number
  total: number
}

interface PendingFigure {
  id: string
  name: string
  brand: { name: string }
  line: { name: string }
  images: { url: string }[]
  createdAt: string
  createdBy: { username: string } | null
}

interface PendingBrand {
  id: string
  name: string
  country: string | null
  createdAt: string
  createdBy: { username: string } | null
}

interface PendingLine {
  id: string
  name: string
  brand: { name: string }
  createdAt: string
  createdBy: { username: string } | null
}

interface PendingSeries {
  id: string
  name: string
  createdAt: string
  createdBy: { username: string } | null
}

interface PendingCharacter {
  id: string
  name: string
  series: { name: string } | null
  createdAt: string
  createdBy: { username: string } | null
}

interface Props {
  initialCounts: Counts
}

const tabs: { key: ContentType; label: string; icon: React.ElementType }[] = [
  { key: 'figures', label: 'Figuras', icon: Package },
  { key: 'brands', label: 'Marcas', icon: Building2 },
  { key: 'lines', label: 'Líneas', icon: Layers },
  { key: 'series', label: 'Series', icon: Film },
  { key: 'characters', label: 'Personajes', icon: Users }
]

export default function PendingClient({ initialCounts }: Props) {
  const [activeTab, setActiveTab] = useState<ContentType>('figures')
  const [counts, setCounts] = useState<Counts>(initialCounts)
  const [data, setData] = useState<{
    figures?: PendingFigure[]
    brands?: PendingBrand[]
    lines?: PendingLine[]
    series?: PendingSeries[]
    characters?: PendingCharacter[]
  }>({})
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/pending?type=${activeTab}`)
      if (res.ok) {
        const result = await res.json()
        setData(prev => ({ ...prev, [activeTab]: result[activeTab] }))
        setCounts(result.counts)
      }
    } catch (error) {
      console.error('Error fetching pending:', error)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleApprove = async (type: string, id: string) => {
    setProcessing(id)
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: type.slice(0, -1), id, approved: true })
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error approving:', error)
    } finally {
      setProcessing(null)
    }
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('¿Estás seguro de eliminar este contenido?')) return

    setProcessing(id)
    try {
      const res = await fetch(`/api/admin/approve?type=${type.slice(0, -1)}&id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting:', error)
    } finally {
      setProcessing(null)
    }
  }

  const currentData = data[activeTab] || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0a0a1a] to-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <Clock className="text-amber-400" />
                Contenido Pendiente
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {counts.total} elementos pendientes de aprobación
              </p>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-white/20' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={32} className="animate-spin text-primary" />
            </div>
          ) : currentData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Check size={48} className="mb-4 text-green-400" />
              <p className="text-lg">No hay contenido pendiente</p>
              <p className="text-sm">Todo está al día</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {activeTab === 'figures' && (data.figures || []).map(item => (
                  <FigureItem
                    key={item.id}
                    item={item}
                    processing={processing === item.id}
                    onApprove={() => handleApprove('figures', item.id)}
                    onDelete={() => handleDelete('figures', item.id)}
                  />
                ))}
                {activeTab === 'brands' && (data.brands || []).map(item => (
                  <GenericItem
                    key={item.id}
                    name={item.name}
                    subtitle={item.country || 'Sin país'}
                    createdBy={item.createdBy?.username}
                    processing={processing === item.id}
                    onApprove={() => handleApprove('brands', item.id)}
                    onDelete={() => handleDelete('brands', item.id)}
                    icon={Building2}
                  />
                ))}
                {activeTab === 'lines' && (data.lines || []).map(item => (
                  <GenericItem
                    key={item.id}
                    name={item.name}
                    subtitle={item.brand.name}
                    createdBy={item.createdBy?.username}
                    processing={processing === item.id}
                    onApprove={() => handleApprove('lines', item.id)}
                    onDelete={() => handleDelete('lines', item.id)}
                    icon={Layers}
                  />
                ))}
                {activeTab === 'series' && (data.series || []).map(item => (
                  <GenericItem
                    key={item.id}
                    name={item.name}
                    subtitle="Serie"
                    createdBy={item.createdBy?.username}
                    processing={processing === item.id}
                    onApprove={() => handleApprove('series', item.id)}
                    onDelete={() => handleDelete('series', item.id)}
                    icon={Film}
                  />
                ))}
                {activeTab === 'characters' && (data.characters || []).map(item => (
                  <GenericItem
                    key={item.id}
                    name={item.name}
                    subtitle={item.series?.name || 'Sin serie'}
                    createdBy={item.createdBy?.username}
                    processing={processing === item.id}
                    onApprove={() => handleApprove('characters', item.id)}
                    onDelete={() => handleDelete('characters', item.id)}
                    icon={Users}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function FigureItem({
  item,
  processing,
  onApprove,
  onDelete
}: {
  item: PendingFigure
  processing: boolean
  onApprove: () => void
  onDelete: () => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex items-center gap-4 p-4 bg-black/20 rounded-xl border border-white/5"
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
        {item.images[0] ? (
          <Image
            src={item.images[0].url}
            alt={item.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <Package size={24} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white truncate">{item.name}</h3>
        <p className="text-sm text-gray-400">{item.brand.name} - {item.line.name}</p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <AlertCircle size={12} />
          Por: {item.createdBy?.username || 'Desconocido'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onApprove}
          disabled={processing}
          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
        >
          <Check size={20} />
        </button>
        <button
          onClick={onDelete}
          disabled={processing}
          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>
      </div>
    </motion.div>
  )
}

function GenericItem({
  name,
  subtitle,
  createdBy,
  processing,
  onApprove,
  onDelete,
  icon: Icon
}: {
  name: string
  subtitle: string
  createdBy?: string
  processing: boolean
  onApprove: () => void
  onDelete: () => void
  icon: React.ElementType
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex items-center gap-4 p-4 bg-black/20 rounded-xl border border-white/5"
    >
      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 flex-shrink-0">
        <Icon size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white truncate">{name}</h3>
        <p className="text-sm text-gray-400">{subtitle}</p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <AlertCircle size={12} />
          Por: {createdBy || 'Desconocido'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onApprove}
          disabled={processing}
          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
        >
          <Check size={20} />
        </button>
        <button
          onClick={onDelete}
          disabled={processing}
          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>
      </div>
    </motion.div>
  )
}
