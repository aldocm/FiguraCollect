'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AddToInventoryButton } from '@/components/AddToInventoryButton'
import {
  Star, Calendar, Box, Scale, Factory, Tag, ChevronRight, User
} from 'lucide-react'
import type { MeasureUnit } from '@/lib/utils'
import { ImageGallery, ImageModal, DimensionsCard, ReviewSection } from './components'

// --- Types ---
type Figure = {
  id: string
  name: string
  description: string | null
  sku: string | null
  heightCm: number | null
  widthCm: number | null
  depthCm: number | null
  scale: string | null
  material: string | null
  maker: string | null
  releaseDate: string | null
  isReleased: boolean
  priceMXN: number | null
  priceUSD: number | null
  priceYEN: number | null
  brand: { id: string; name: string }
  line: { id: string; name: string }
  character?: { id: string; name: string; series?: { id: string; name: string } | null } | null
  images: { id: string; url: string }[]
  tags: { tag: { name: string } }[]
  series: { series: { id: string; name: string } }[]
  variants: { id: string; name: string; priceMXN: number | null; images: { url: string }[] }[]
  reviews: { id: string; rating: number; title: string; description: string; user: { username: string }; images?: { id: string; url: string }[] }[]
}

type UserType = { id: string; measureUnit?: string } | null
type UserFigure = { id: string; status: string } | null

interface FigureDetailClientProps {
  figure: Figure
  user: UserType
  userFigure: UserFigure
  defaultMeasureUnit?: MeasureUnit
}

// --- Demo Data (for visualization when figure has no images) ---
const DEMO_IMAGES = [
  { id: 'd1', url: 'https://tamashiiweb.com/images/item/item_0000015043_4WRsFsBU_01.jpg' },
  { id: 'd2', url: 'https://tamashiiweb.com/images/item/item_0000015043_NKroScjk_03.jpg' },
  { id: 'd3', url: 'https://tamashiiweb.com/images/item/item_0000015043_NKroScjk_05.jpg' },
  { id: 'd4', url: 'https://tamashiiweb.com/images/item/item_0000015043_NKroScjk_08.jpg' },
  { id: 'd5', url: 'https://tamashiiweb.com/images/item/item_0000015043_NKroScjk_09.jpg' },
]

const LONG_DESCRIPTION =
  "Esta figura captura la esencia del personaje con un nivel de detalle impresionante. Esculpida meticulosamente para representar fielmente su aparición en el arco final de la serie, cuenta con más de 30 puntos de articulación que permiten recrear cualquier pose de batalla icónica.\n\n" +
  "El acabado de pintura utiliza técnicas de sombreado multicapa para resaltar la musculatura y los pliegues de la ropa, dando una sensación de realismo y profundidad única en esta escala.";

// --- Info Badge Component ---
const InfoBadge = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) => {
  if (!value) return null
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
      <div className="p-2 rounded-full bg-primary/20 text-primary">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{label}</p>
        <p className="text-sm text-white font-medium">{value}</p>
      </div>
    </div>
  )
}

// --- Main Component ---
export default function FigureDetailClient({
  figure,
  user,
  userFigure,
  defaultMeasureUnit = 'cm'
}: FigureDetailClientProps) {
  // Use demo data if figure has no images
  const useDemo = figure.images.length === 0
  const images = useDemo ? DEMO_IMAGES : figure.images
  const description = useDemo ? LONG_DESCRIPTION : (figure.description || "Sin descripción.")

  // State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [measureUnit, setMeasureUnit] = useState<MeasureUnit>(
    (user?.measureUnit as MeasureUnit) || defaultMeasureUnit
  )

  const selectedImage = images[selectedImageIndex]

  // Navigation handlers
  const handlePrevImage = useCallback(() => {
    setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const handleNextImage = useCallback(() => {
    setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevImage()
      if (e.key === 'ArrowRight') handleNextImage()
      if (e.key === 'Escape') setIsImageModalOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrevImage, handleNextImage])

  return (
    <div className="flex-1 pb-20 relative bg-background">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-background/85 z-10" />
        <motion.img
          key={selectedImage.url}
          src={selectedImage.url}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.5 }}
          className="w-full h-full object-cover blur-[100px] scale-150 opacity-50"
          alt=""
        />
      </div>

      <div className="relative z-30 max-w-8xl mx-auto px-2 md:px-2 pt-1 md:pt-4 lg:pt-8">
        {/* Main Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* Images Section */}
          <div className="order-1 lg:col-span-7 lg:row-start-1 w-full">
            <ImageGallery
              images={images}
              figureName={figure.name}
              figureId={figure.id}
              onImageClick={() => setIsImageModalOpen(true)}
              selectedIndex={selectedImageIndex}
              onIndexChange={setSelectedImageIndex}
            />
          </div>

          {/* Info & Specs Section */}
          <div className="order-2 lg:col-span-5 lg:row-start-1 lg:row-end-4 w-full">
            <div className="space-y-6 lg:space-y-8">
              {/* Main Info Block */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-uiBase/30 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 md:p-6 border border-white/10 shadow-2xl"
              >
                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 mb-4 lg:mb-6">
                  <Link href={`/catalog?brandId=${figure.brand.id}`} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 hover:bg-primary/20 transition-colors">
                    {figure.brand.name}
                  </Link>
                  <Link href={`/catalog?lineId=${figure.line.id}`} className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/10 hover:bg-white/20 transition-colors">
                    {figure.line.name}
                  </Link>
                  {figure.series.map(s => (
                    <Link key={s.series.id} href={`/catalog?seriesId=${s.series.id}`} className="px-3 py-1 rounded-full bg-white/5 text-gray-400 text-xs border border-white/5 hover:text-white hover:bg-white/10 transition-colors">
                      {s.series.name}
                    </Link>
                  ))}
                </div>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-title font-black text-white leading-[1.1] mb-3 lg:mb-4 text-balance">
                  {figure.name}
                </h1>

                <div className="flex items-center justify-between border-b border-white/10 pb-4 lg:pb-6 mb-4 lg:mb-6">
                  <div className="flex items-center gap-2 lg:gap-4 text-gray-400 flex-wrap">
                    {figure.releaseDate && (
                      <span className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm font-medium bg-white/5 px-2 lg:px-3 py-1 rounded-md capitalize">
                        <Calendar size={14} className="text-accent" />
                        {(() => {
                          const dateStr = figure.releaseDate.length > 7
                            ? figure.releaseDate
                            : figure.releaseDate + '-01'
                          const date = new Date(dateStr)
                          return figure.releaseDate.length > 7
                            ? date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }).replace(/ de /g, ' ')
                            : date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' }).replace(/ de /g, ' ')
                        })()}
                      </span>
                    )}
                    {!figure.isReleased && (
                      <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded uppercase border border-blue-500/30 tracking-wide">
                        Por Lanzar
                      </span>
                    )}
                    {figure.reviews.length > 0 && (
                      <span className="flex items-center gap-1.5 text-xs lg:text-sm font-medium bg-accent/10 px-2 lg:px-3 py-1 rounded-md border border-accent/20">
                        <Star size={14} className="text-accent" fill="currentColor" />
                        <span className="text-accent font-bold">
                          {(figure.reviews.reduce((acc, r) => acc + r.rating, 0) / figure.reviews.length).toFixed(1)}
                        </span>
                        <span className="text-gray-500 text-xs">({figure.reviews.length})</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white/5 p-2 rounded-xl lg:rounded-2xl border border-white/10">
                  {user ? (
                    <AddToInventoryButton
                      figureId={figure.id}
                      currentStatus={userFigure?.status || null}
                      userFigureId={userFigure?.id || null}
                      isReleased={figure.isReleased}
                    />
                  ) : (
                    <Link
                      href="/login"
                      className="block w-full py-3 lg:py-4 bg-primary hover:bg-primary/90 text-center rounded-xl text-white font-bold transition-all shadow-lg shadow-primary/20 text-sm lg:text-base"
                    >
                      Inicia sesión para coleccionar
                    </Link>
                  )}
                </div>

                {/* Price */}
                {figure.priceMXN && (
                  <div className="mt-3 lg:mt-4">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5 tracking-wider text-center">
                      Precio de Lanzamiento
                    </p>
                    <div className="flex items-baseline gap-1.5 justify-center">
                      <span className="text-xl lg:text-2xl font-title font-bold text-white tracking-tight">
                        ${figure.priceMXN.toLocaleString()}
                      </span>
                      <span className="text-sm lg:text-base text-gray-500 font-medium">MXN</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Specs Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-3"
              >
                {/* Dimensions */}
                <DimensionsCard
                  heightCm={figure.heightCm}
                  widthCm={figure.widthCm}
                  depthCm={figure.depthCm}
                  measureUnit={measureUnit}
                  onToggleUnit={() => setMeasureUnit(u => u === 'cm' ? 'in' : 'cm')}
                />

                {/* Character */}
                {figure.character && (
                  <Link
                    href={`/catalog?characterId=${figure.character.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-sm hover:bg-cyan-500/20 transition-colors cursor-pointer group"
                  >
                    <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/30 transition-colors">
                      <User size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Personaje</p>
                      <p className="text-sm text-white font-medium group-hover:text-cyan-400 transition-colors">
                        {figure.character.name}
                        {figure.character.series && (
                          <span className="text-cyan-400 ml-1">({figure.character.series.name})</span>
                        )}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  </Link>
                )}

                {/* Other specs */}
                <div className="grid grid-cols-2 gap-2 lg:gap-3">
                  <InfoBadge icon={Scale} label="Escala" value={figure.scale || null} />
                  <InfoBadge icon={Box} label="Material" value={figure.material || null} />
                  <InfoBadge icon={Factory} label="Fabricante" value={figure.maker || null} />
                  <InfoBadge icon={Tag} label="SKU" value={figure.sku || null} />
                </div>
              </motion.div>

              {/* Description Section (Moved to Right Column) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-uiBase/40 backdrop-blur-md rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-white/5"
              >
                <h3 className="text-base lg:text-xl font-title font-bold text-white mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3 border-b border-white/10 pb-3 lg:pb-4">
                  <Tag size={18} className="text-primary" /> Descripción Detallada
                </h3>
                <div className="prose prose-invert prose-sm lg:prose-lg prose-p:text-gray-300 prose-p:leading-relaxed max-w-none font-body">
                  {description.split('\n').map((paragraph, i) => (
                    paragraph.trim() && <p key={i} className="mb-3 lg:mb-4 text-sm lg:text-base">{paragraph}</p>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>



          {/* Reviews Section */}
          <div className="order-4 lg:col-span-7 lg:row-start-3 w-full">
            <ReviewSection
              figureId={figure.id}
              reviews={figure.reviews}
              user={user}
              userOwns={userFigure?.status === 'OWNED'}
            />
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={selectedImage.url}
        imageName={figure.name}
        onPrev={handlePrevImage}
        onNext={handleNextImage}
      />
    </div>
  )
}
