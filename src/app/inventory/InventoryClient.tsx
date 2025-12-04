'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Filter, ArrowUpDown, Package, Heart, CalendarClock, 
  DollarSign, TrendingUp, Grid, List as ListIcon, MoreVertical,
  CheckCircle2, Trash2, AlertCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'

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

interface InventoryClientProps {
  items: InventoryItem[]
  user: { name: string | null }
}

// --- Components ---

const StatCard = ({ label, value, icon: Icon, colorClass }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-uiBase/30 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex items-center gap-4 hover:bg-uiBase/50 transition-colors"
  >
    <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20`}>
      <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
    </div>
    <div>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
      <p className="text-2xl font-title font-bold text-white">{value}</p>
    </div>
  </motion.div>
)

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    OWNED: { color: 'bg-green-500', text: 'text-green-400', label: 'En Colección', icon: CheckCircle2 },
    PREORDER: { color: 'bg-blue-500', text: 'text-blue-400', label: 'Pre-orden', icon: CalendarClock },
    WISHLIST: { color: 'bg-pink-500', text: 'text-pink-400', label: 'Deseado', icon: Heart },
  }[status] || { color: 'bg-gray-500', text: 'text-gray-400', label: status, icon: AlertCircle }

  const Icon = config.icon

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${config.text} border-current bg-opacity-10 bg-black`}>
      <Icon size={12} />
      {config.label}
    </span>
  )
}

const InventoryCard = ({ item, onUpdate }: { item: InventoryItem, onUpdate: () => void }) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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
            
            <div className="absolute top-3 left-3">
                <StatusBadge status={item.status} />
            </div>
            
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
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

// --- Main Client Component ---

export default function InventoryClient({ items, user }: InventoryClientProps) {
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState<string | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Refresh helper
  const refreshData = () => {
    router.refresh()
  }

  // Filtering Logic
  const filteredItems = items.filter(item => {
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus
    const matchesSearch = item.figure.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.figure.brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Stats Calculation
  const totalCount = items.length
  const totalValue = items.reduce((acc, item) => acc + (item.userPrice || item.figure.priceMXN || 0), 0)
  const ownedCount = items.filter(i => i.status === 'OWNED').length
  const preorderCount = items.filter(i => i.status === 'PREORDER').length
  const wishlistCount = items.filter(i => i.status === 'WISHLIST').length

  return (
    <div className="min-h-screen bg-background pb-20">
       {/* Decorative Background */}
       <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
       </div>

       <div className="relative z-10 container mx-auto px-4 py-8">
          
          {/* Header Section */}
          <header className="mb-10">
             <h1 className="text-4xl md:text-5xl font-title font-black text-white mb-2">
                Mi <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Colección</span>
             </h1>
             <p className="text-gray-400 text-lg">
                Gestiona y visualiza tu universo de figuras.
             </p>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard 
                label="Valor Total Estimado" 
                value={`$${totalValue.toLocaleString()} MXN`} 
                icon={DollarSign} 
                colorClass="text-green-500" 
              />
              <StatCard 
                label="Figuras en Mano" 
                value={ownedCount} 
                icon={Package} 
                colorClass="text-purple-500" 
              />
              <StatCard 
                label="Pre-ordenes" 
                value={preorderCount} 
                icon={CalendarClock} 
                colorClass="text-blue-500" 
              />
              <StatCard 
                label="En Wishlist" 
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
                      {tab === 'ALL' ? 'Todas' : tab === 'OWNED' ? 'Colección' : tab === 'PREORDER' ? 'Pre-orden' : 'Wishlist'}
                   </button>
                ))}
             </div>

             {/* Search */}
             <div className="relative w-full md:w-auto md:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre, marca..." 
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
                   <h3 className="text-xl font-bold text-white mb-2">No se encontraron figuras</h3>
                   <p className="text-gray-500">Intenta cambiar los filtros o agrega nuevas figuras desde el catálogo.</p>
                   <Link href="/catalog" className="inline-block mt-6 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors">
                      Ir al Catálogo
                   </Link>
                </motion.div>
             )}
          </AnimatePresence>

       </div>
    </div>
  )
}
