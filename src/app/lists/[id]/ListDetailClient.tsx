'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, List as ListIcon, CheckCircle2, Star, Share2, Calendar, AlertCircle } from 'lucide-react'
import FigureCard from '@/components/FigureCard'
import { ListActions } from '@/components/ListActions'

// Types matching the query
interface ListDetailClientProps {
  list: any // We'll type this properly or use 'any' for now given complex relations
  currentUser: any
  canEdit: boolean
  canSetFeatured: boolean
}

export default function ListDetailClient({
  list,
  currentUser,
  canEdit,
  canSetFeatured
}: ListDetailClientProps) {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100 } 
    }
  }

  // Calculate some stats
  const totalFigures = list.items.length
  const totalValue = list.items.reduce((acc: number, item: any) => acc + (item.figure.priceMXN || 0), 0)
  const hasPrices = totalValue > 0

  // Background images for hero (take up to 4)
  const heroImages = list.items
    .slice(0, 4)
    .map((item: any) => item.figure.images[0]?.url)
    .filter(Boolean)

  return (
    <div className="min-h-screen pb-20">
      
      {/* Hero Header */}
      <div className="relative -mx-4 md:-mx-8 lg:-mx-16 -mt-8 mb-12 overflow-hidden">
        
        {/* Background Blur Layer */}
        <div className="absolute inset-0 bg-background/80 z-10 backdrop-blur-xl" />
        <div className="absolute inset-0 z-0 grid grid-cols-4 opacity-30">
           {heroImages.map((url: string, i: number) => (
             <div key={i} className="relative h-64 md:h-80">
               <img src={url} alt="" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
             </div>
           ))}
        </div>
        
        {/* Content */}
        <div className="relative z-20 px-4 md:px-8 lg:px-16 py-12 md:py-20 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* List Cover / First Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-uiBase"
            >
              {heroImages[0] ? (
                <img src={heroImages[0]} alt="List Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">
                  <ListIcon size={48} />
                </div>
              )}
            </motion.div>

            <div className="flex-1 space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-3"
              >
                {list.isOfficial && (
                  <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> OFICIAL
                  </span>
                )}
                {list.isFeatured && (
                  <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star size={12} /> DESTACADA
                  </span>
                )}
                <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">
                  Creada {new Date(list.createdAt).toLocaleDateString()}
                </span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-title font-bold text-white leading-tight"
              >
                {list.name}
              </motion.h1>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 text-gray-300"
              >
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                  {list.createdBy.username.charAt(0).toUpperCase()}
                </div>
                <span>por <span className="text-white font-medium">@{list.createdBy.username}</span></span>
              </motion.div>

              {list.description && (
                 <motion.p 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.3 }}
                   className="text-gray-400 max-w-2xl text-lg"
                 >
                   {list.description}
                 </motion.p>
              )}
              
              {/* Stats & Actions Row */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-6 pt-4"
              >
                 <div className="flex gap-8 border-r border-white/10 pr-8">
                   <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">Figuras</p>
                     <p className="text-2xl font-title font-bold text-white">{totalFigures}</p>
                   </div>
                   {hasPrices && (
                     <div>
                       <p className="text-xs text-gray-500 uppercase font-bold">Valor Est.*</p>
                       <p className="text-2xl font-title font-bold text-accent">
                         ${totalValue.toLocaleString('es-MX')}
                       </p>
                     </div>
                   )}
                 </div>

                 <div className="flex items-center gap-3">
                   {canEdit && (
                     <div className="bg-uiBase border border-white/10 rounded-lg p-1">
                       {/* We need to style the ListActions component or wrap it properly */}
                       <ListActions
                         listId={list.id}
                         isFeatured={list.isFeatured}
                         canSetFeatured={canSetFeatured}
                       />
                     </div>
                   )}
                   {/* Future: Share Button */}
                   <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                     <Share2 size={20} />
                   </button>
                 </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* List Content */}
      <div className="max-w-7xl mx-auto">
        {list.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-uiBase/30">
            <AlertCircle className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Lista vacía</h3>
            <p className="text-gray-500 mb-6">Esta colección aún no tiene figuras.</p>
            {canEdit && (
              <Link 
                href="/catalog"
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full font-medium transition-colors"
              >
                Ir al Catálogo
              </Link>
            )}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {list.items.map((item: any) => (
              <motion.div key={item.id} variants={itemVariants} layoutId={item.figureId}>
                 {/* We use the FigureCard but we need to adapt data structure slightly if needed.
                     FigureCard expects 'figure' prop with relations.
                     Our 'item' has 'figure' inside.
                 */}
                 <div className="h-full relative">
                   <div className="absolute -top-3 -left-3 z-10 w-8 h-8 bg-black/80 text-white flex items-center justify-center rounded-full text-sm font-bold border border-white/10 shadow-lg">
                     {item.order + 1}
                   </div>
                   <FigureCard figure={item.figure} />
                 </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
