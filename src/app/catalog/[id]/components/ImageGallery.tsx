'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageGalleryProps {
  images: { id: string; url: string }[]
  figureName: string
  figureId: string
  onImageClick: () => void
  selectedIndex: number
  onIndexChange: (index: number) => void
}

export function ImageGallery({
  images,
  figureName,
  figureId,
  onImageClick,
  selectedIndex,
  onIndexChange
}: ImageGalleryProps) {
  const selectedImage = images[selectedIndex]

  const handlePrevImage = () => {
    onIndexChange(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)
  }

  const handleNextImage = () => {
    onIndexChange(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1)
  }

  return (
    <div className="space-y-2 md:space-y-4">
      {/* Main Image Viewer */}
      <motion.div
        layoutId={`main-image-${figureId}`}
        className="relative aspect-square md:aspect-square lg:aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-uiBase/30 group cursor-zoom-in"
        onClick={onImageClick}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedImage.url}
            src={selectedImage.url}
            alt={figureName}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-contain"
          />
        </AnimatePresence>

        {/* Hover Navigation Arrows */}
        <div className="absolute inset-0 flex items-center justify-between p-2 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <button
            onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
            className="p-2 md:p-3 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-primary hover:text-white transition-all pointer-events-auto transform hover:-translate-x-1"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
            className="p-2 md:p-3 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-primary hover:text-white transition-all pointer-events-auto transform hover:translate-x-1"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-black/60 backdrop-blur-md text-white text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full pointer-events-none font-medium border border-white/10">
          {selectedIndex + 1} / {images.length}
        </div>
      </motion.div>

      {/* Thumbnail Strip */}
      <div className="relative group">
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-4 pt-1 md:pt-2 custom-scrollbar snap-x">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => onIndexChange(idx)}
              className={`relative flex-shrink-0 w-14 h-14 md:w-24 md:h-24 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all snap-start ${
                selectedIndex === idx
                  ? 'border-primary shadow-[0_0_15px_-3px_rgba(225,6,44,0.5)] scale-100 ring-2 ring-primary/30'
                  : 'border-white/10 hover:border-white/40 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
