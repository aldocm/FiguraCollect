'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, FigureImage } from '@prisma/client'
import { ListPlus, ImageOff } from 'lucide-react'

// Define types for the data props based on the prisma queries in page.tsx
type FigureImageOnly = {
  images: { url: string }[]
}

type ListItemWithFigureImage = {
  id: string
  figure: {
    images: { url: string }[]
  }
}

type ListWithRelations = {
  id: string
  name: string
  createdBy: { username: string }
  items: ListItemWithFigureImage[]
  _count: { items: number }
}

interface FeaturedListCardProps {
  list: ListWithRelations
  animationVariants?: any // Optional framer-motion variants
}

const FeaturedListCard = ({ list, animationVariants }: FeaturedListCardProps) => {
  const images = list.items.map(item => item.figure.images[0]?.url).filter(Boolean) as string[]

  return (
    <motion.div variants={animationVariants}>
      <Link
        href={`/lists/${list.id}`}
        className="group block bg-uiBase rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(225,6,44,0.2)] h-full flex flex-col"
      >
        <div className="relative aspect-video bg-gray-900 overflow-hidden">
          {images.length > 0 ? (
            <div className="grid grid-cols-2 grid-rows-2 h-full gap-[1px]">
              {images.slice(0, 4).map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Figura en lista ${list.name}`}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/20 p-4">
              <ImageOff size={32} className="mb-2" />
              <p className="text-xs text-center">Sin imágenes en la lista</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <p className="text-sm text-white font-semibold flex items-center gap-1">
              <ListPlus size={16} /> {list._count.items} ítems
            </p>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow relative">
          {/* Hover accent line */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

          <h3 className="font-medium text-white text-lg leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {list.name}
          </h3>
          <p className="text-xs text-gray-500 mb-3">Creado por @{list.createdBy.username}</p>
        </div>
      </Link>
    </motion.div>
  )
}

export default FeaturedListCard
