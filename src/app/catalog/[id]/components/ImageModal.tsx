'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  imageName: string
  onPrev: () => void
  onNext: () => void
}

export function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  onPrev,
  onNext
}: ImageModalProps) {
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onPrev, onNext, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center"
          onClick={onClose}
        >
          <button className="absolute top-6 right-6 text-white/50 hover:text-white p-2 z-50">
            <X size={32} />
          </button>

          <div
            className="w-full h-full p-4 md:p-10 flex items-center justify-center relative"
            onClick={e => e.stopPropagation()}
          >
            <TransformWrapper>
              <TransformComponent
                wrapperClass="!w-full !h-full"
                contentClass="!w-full !h-full flex items-center justify-center"
              >
                <img
                  src={imageUrl}
                  alt={imageName}
                  className="max-w-full max-h-full object-contain"
                />
              </TransformComponent>
            </TransformWrapper>

            {/* Modal Navigation */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
            >
              <ChevronLeft size={40} />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
              onClick={(e) => { e.stopPropagation(); onNext(); }}
            >
              <ChevronRight size={40} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Simple modal for review images (without zoom controls)
interface ReviewImageModalProps {
  imageUrl: string | null
  onClose: () => void
}

export function ReviewImageModal({ imageUrl, onClose }: ReviewImageModalProps) {
  return (
    <AnimatePresence>
      {imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={onClose}
        >
          <button className="absolute top-6 right-6 text-white/50 hover:text-white p-2 z-50">
            <X size={32} />
          </button>

          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            src={imageUrl}
            alt="Imagen de opinión"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
