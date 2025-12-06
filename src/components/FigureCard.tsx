'use client'

import React from 'react'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { ChevronDown, Clock, Star } from 'lucide-react'
import { Figure, Brand, FigureImage, Line } from '@prisma/client'
import { formatFigurePrice } from '@/lib/utils'

// Extending the Figure type to include relations
type FigureWithRelations = Figure & {
  brand: Brand
  line?: Line // Line might not always be included in the HomePage queries
  images: FigureImage[]
  averageRating?: number
}

interface FigureCardProps {
  figure: FigureWithRelations
  animationVariants?: Variants
}

const FigureCard = ({ figure, animationVariants }: FigureCardProps) => {
  const priceDisplay = formatFigurePrice(figure)

  return (
    <motion.div variants={animationVariants}>
      <Link
        href={`/catalog/${figure.id}`}
        className="group block bg-uiBase rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(225,6,44,0.2)] h-full flex flex-col"
      >
        <div className="aspect-square relative overflow-hidden bg-gray-900">
          {figure.images[0] ? (
            <img
              src={figure.images[0].url}
              alt={figure.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              No Image
            </div>
          )}

          {/* Badge overlay */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            {priceDisplay && (
              <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10">
                {priceDisplay}
              </span>
            )}
            {!figure.isReleased && figure.releaseDate && (
              <span className="bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg ml-auto flex items-center gap-1">
                <Clock size={12} className="md:hidden" />
                <span className="hidden md:inline">Por Lanzar</span>
              </span>
            )}
            
            {/* Rating Badge */}
            {figure.averageRating !== undefined && figure.averageRating > 0 && (
               <span className={`
                 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-1 rounded border border-white/10 flex items-center gap-1 shadow-lg
                 ${!figure.isReleased ? 'ml-2' : 'ml-auto'} 
                 bg-yellow-500/80 border-yellow-400/30
               `}>
                 <Star size={10} className="fill-white" />
                 {figure.averageRating.toFixed(1)}
               </span>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow relative">
          {/* Hover accent line */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

          <div className="flex justify-between items-start gap-2 mb-1">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {figure.brand.name}
            </span>
          </div>

          <h3 className="font-medium text-white text-base leading-tight mb-2 line-clamp-2 h-[2.5rem] group-hover:text-primary transition-colors">
            {figure.name}
          </h3>

          <div className="mt-auto hidden md:flex pt-2 border-t border-white/5 justify-between items-center">
            <span className="text-xs text-gray-500">
              {figure.line?.name}
            </span>
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <ChevronDown size={14} className="-rotate-90" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default React.memo(FigureCard)
