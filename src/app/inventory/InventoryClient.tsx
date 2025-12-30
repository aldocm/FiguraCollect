'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Package, Heart, CalendarClock,
  DollarSign,
  CheckCircle2, Trash2, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

// --- Types ---
// Adapting to the structure returned by Prisma in page.tsx
type InventoryItem = {
  id: string
  status: string // WISHLIST | PREORDER | OWNED
  userPrice: number | null
  preorderMonth: string | null
  createdAt: Date
  figure: {
    id: string
    name: string
    priceMXN: number | null
    isReleased: boolean
    releaseDate: string | null
    brand: { name: string }
    line: { name: string }
    images: { url: string }[]
  }
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

interface InventoryClientProps {
  items: InventoryItem[]
  user: { name: string | null }
  pagination?: PaginationInfo
}

// --- Components ---

const StatCard = ({ label, value, icon: Icon, colorClass }: { label: string, value: number | string, icon: React.ElementType, colorClass: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-uiBase/30 backdrop-blur-md border border-white/5 p-3 md:p-4 rounded-xl flex items-center gap-3 hover:bg-uiBase/50 transition-colors"
  >
    <div className={`p-2 rounded-lg ${colorClass} bg-opacity-20`}>
      <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-lg md:text-xl font-title font-bold text-white">{value}</p>
    </div>
  </motion.div>
)

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    OWNED: { bgClass: 'bg-green-500/20', iconClass: 'text-green-400', icon: CheckCircle2 },
    PREORDER: { bgClass: 'bg-blue-500/20', iconClass: 'text-blue-400', icon: CalendarClock },
    WISHLIST: { bgClass: 'bg-pink-500/20', iconClass: 'text-pink-400', icon: Heart },
  }[status] || { bgClass: 'bg-gray-500/20', iconClass: 'text-gray-400', icon: AlertCircle }

  const Icon = config.icon

  return (
    <span className={`flex items-center justify-center w-8 h-8 rounded-full ${config.bgClass} backdrop-blur-sm border border-white/10`}>
      <Icon size={16} className={config.iconClass} />
    </span>
  )
}

const InventoryCard = ({ item, onUpdate }: { item: InventoryItem, onUpdate: () => void }) => {
  const [, setIsLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true)
    try {
      await fetch(`/api/inventory/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      onUpdate() // Refresh local state or router
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar de tu colección?')) return
    setIsLoading(true)
    try {
      await fetch(`/api/inventory/${item.id}`, { method: 'DELETE' })
      onUpdate()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative bg-uiBase/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
    >
        {/* Image Area */}
        <Link href={`/catalog/${item.figure.id}`} className="block relative aspect-square overflow-hidden bg-black/50">
            {item.figure.images[0] ? (
                <img 
                    src={item.figure.images[0].url} 
                    alt={item.figure.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">Sin Imagen</div>
            )}
            
            <div className="absolute top-3 right-3 z-10">
                <StatusBadge status={item.status} />
            </div>

            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 {/* Quick Actions Overlay */}
                 <div className="flex gap-2">
                    {item.status === 'WISHLIST' && (
                        <button 
                            onClick={(e) => { e.preventDefault(); handleStatusChange('PREORDER'); }}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 shadow-lg"
                            title="Mover a Pre-orden"
                        >
                            <CalendarClock size={16} />
                        </button>
                    )}
                    {item.status === 'PREORDER' && (
                        <button 
                            onClick={(e) => { e.preventDefault(); handleStatusChange('OWNED'); }}
                            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-500 shadow-lg"
                            title="Marcar como Recibido"
                        >
                            <CheckCircle2 size={16} />
                        </button>
                    )}
                    <button 
                        onClick={(e) => { e.preventDefault(); handleDelete(); }}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-500 shadow-lg"
                        title="Eliminar"
                    >
                        <Trash2 size={16} />
                    </button>
                 </div>
            </div>
        </Link>

        {/* Content Area */}
        <div className="p-4 flex flex-col flex-grow">
            <div className="mb-2">
                <span className="text-xs text-primary font-bold uppercase tracking-wider">{item.figure.brand.name}</span>
                <h3 className="font-bold text-white leading-tight line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                    {item.figure.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{item.figure.line.name}</p>
            </div>

            <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-end">
                 <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Valor</p>
                    <p className="text-sm font-bold text-white">
                        ${(item.userPrice || item.figure.priceMXN || 0).toLocaleString()} MXN
                    </p>
                 </div>
                 {item.preorderMonth && item.status === 'PREORDER' && (
                     <div className="text-right">
                        <p className="text-[10px] text-blue-400 uppercase font-bold">Llegada</p>
                        <p className="text-xs text-gray-300">{item.preorderMonth}</p>
                     </div>
                 )}
            </div>
        </div>
    </motion.div>
  )
}

// --- Pagination Component ---
const Pagination = ({ pagination }: { pagination: PaginationInfo }) => {
  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination
  const router = useRouter()

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      router.push(`/inventory?page=${page}`)
    }
  }

  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-uiBase/30 backdrop-blur-md rounded-xl border border-white/5">
      <p className="text-sm text-gray-400">
        Mostrando <span className="text-white font-medium">{startItem}-{endItem}</span> de{' '}
        <span className="text-white font-medium">{totalItems}</span> items
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }
            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  currentPage === pageNum
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

// --- Main Client Component ---

export default function InventoryClient({ items, pagination }: InventoryClientProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [filterStatus, setFilterStatus] = useState<string | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Refresh helper
  const refreshData = () => {
    router.refresh()
  }

  // Filtering Logic (client-side filtering on current page items)
  const filteredItems = items.filter(item => {
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus
    const matchesSearch = item.figure.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.figure.brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Stats Calculation (using pagination total if available)
  const totalValue = items.reduce((acc, item) => acc + (item.userPrice || item.figure.priceMXN || 0), 0)
  const ownedCount = items.filter(i => i.status === 'OWNED').length
  const preorderCount = items.filter(i => i.status === 'PREORDER').length
  const wishlistCount = items.filter(i => i.status === 'WISHLIST').length

  return (
    <div className="flex-1 bg-background pb-20">
       {/* Decorative Background */}
       <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
       </div>

       <div className="relative z-10 container mx-auto px-1 md:px-4">

          {/* Header Section */}
          <header className="mb-6 md:mb-8">
             <h1 className="text-2xl md:text-4xl font-title font-black text-white mb-1 md:mb-2">
                {t.inventory.myCollection.split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">{t.inventory.myCollection.split(' ').slice(1).join(' ')}</span>
             </h1>
             <p className="text-gray-400 text-sm">
                {t.inventory.manageCollection}
             </p>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-10">
              <StatCard
                label={t.inventory.totalValue}
                value={`$${totalValue.toLocaleString()} ${t.inventory.currency}`}
                icon={DollarSign}
                colorClass="text-green-500"
              />
              <StatCard
                label={t.inventory.figuresOwned}
                value={ownedCount}
                icon={Package}
                colorClass="text-purple-500"
              />
              <StatCard
                label={t.inventory.preorders}
                value={preorderCount}
                icon={CalendarClock}
                colorClass="text-blue-500"
              />
              <StatCard
                label={t.inventory.inWishlist}
                value={wishlistCount}
                icon={Heart}
                colorClass="text-pink-500"
              />
          </div>

          {/* Toolbar: Filter & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between bg-uiBase/20 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
             
             {/* Tabs */}
             <div className="flex bg-black/20 p-1 rounded-xl overflow-hidden">
                {['ALL', 'OWNED', 'PREORDER', 'WISHLIST'].map((tab) => (
                   <button
                     key={tab}
                     onClick={() => setFilterStatus(tab)}
                     className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        filterStatus === tab
                        ? 'bg-white/10 text-white shadow-lg'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                     }`}
                   >
                      {tab === 'ALL' ? t.inventory.allFilter : tab === 'OWNED' ? t.inventory.collectionFilter : tab === 'PREORDER' ? t.inventory.preorderStatus : t.inventory.wishlist}
                   </button>
                ))}
             </div>

             {/* Search */}
             <div className="relative w-full md:w-auto md:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder={t.inventory.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                />
             </div>
          </div>

          {/* Results Grid */}
          <AnimatePresence mode="popLayout">
             {filteredItems.length > 0 ? (
                <motion.div 
                   layout
                   className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                >
                   {filteredItems.map(item => (
                      <InventoryCard key={item.id} item={item} onUpdate={refreshData} />
                   ))}
                </motion.div>
             ) : (
                <motion.div
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                   className="text-center py-20"
                >
                   <div className="inline-flex p-6 rounded-full bg-white/5 mb-4 text-gray-600">
                      <Package size={48} strokeWidth={1} />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">{t.inventory.noFiguresFound}</h3>
                   <p className="text-gray-500">{t.inventory.tryChangingFilters}</p>
                   <Link href="/catalog" className="inline-block mt-6 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors">
                      {t.inventory.goToCatalog}
                   </Link>
                </motion.div>
             )}
          </AnimatePresence>

          {/* Pagination */}
          {pagination && <Pagination pagination={pagination} />}

       </div>
    </div>
  )
}
