'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Box, Tag, Layers, Package, ArrowRight, Command } from 'lucide-react'

interface SearchResult {
  id: string
  name: string
  type: 'figure' | 'brand' | 'line' | 'series'
  image?: string
  subtitle?: string
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!isOpen) {
          // This would need to be handled by parent, but we handle close here
        }
      }

      if (!isOpen) return

      // Close with Escape
      if (e.key === 'Escape') {
        onClose()
      }

      // Navigate with arrows
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
      }

      // Select with Enter
      if (e.key === 'Enter' && results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])

  // Search debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results)
          setSelectedIndex(0)
        }
      } catch (e) {
        console.error('Search error', e)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (result: SearchResult) => {
    let path = ''
    switch (result.type) {
      case 'figure':
        path = `/catalog/${result.id}`
        break
      case 'brand':
        path = `/catalog?brandId=${result.id}`
        break
      case 'line':
        path = `/catalog?lineId=${result.id}`
        break
      case 'series':
        path = `/catalog?seriesId=${result.id}`
        break
    }
    router.push(path)
    onClose()
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'figure': return Package
      case 'brand': return Box
      case 'line': return Layers
      case 'series': return Tag
      default: return Package
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'figure': return 'Figura'
      case 'brand': return 'Marca'
      case 'line': return 'Línea'
      case 'series': return 'Serie'
      default: return type
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4"
          >
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                <Search size={20} className="text-gray-500 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar figuras, marcas, líneas, series..."
                  className="flex-grow bg-transparent text-white text-lg placeholder-gray-500 focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 text-gray-500 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-gray-500 font-mono">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="py-8 text-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : results.length > 0 ? (
                  <div className="py-2">
                    {results.map((result, index) => {
                      const Icon = getIcon(result.type)
                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            index === selectedIndex ? 'bg-white/10' : 'hover:bg-white/5'
                          }`}
                        >
                          {/* Image or Icon */}
                          <div className="w-12 h-12 rounded-lg bg-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {result.image ? (
                              <img src={result.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Icon size={20} className="text-gray-500" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-grow min-w-0">
                            <p className="text-white font-medium truncate">{result.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] uppercase font-bold">
                                {getTypeLabel(result.type)}
                              </span>
                              {result.subtitle && <span className="truncate">{result.subtitle}</span>}
                            </p>
                          </div>

                          {/* Arrow */}
                          {index === selectedIndex && (
                            <ArrowRight size={16} className="text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                ) : query ? (
                  <div className="py-8 text-center">
                    <Search size={32} className="mx-auto text-gray-600 mb-2" />
                    <p className="text-gray-500 text-sm">No se encontraron resultados</p>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-gray-500 text-sm mb-4">Escribe para buscar</p>
                    <div className="flex flex-wrap justify-center gap-2 px-4">
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400">Figuras</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400">Marcas</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400">Líneas</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400">Series</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-[10px] text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded font-mono">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded font-mono">↓</kbd>
                    navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded font-mono">↵</kbd>
                    seleccionar
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Command size={10} />K para abrir
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
