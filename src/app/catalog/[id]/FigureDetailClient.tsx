'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AddToInventoryButton } from '@/components/AddToInventoryButton'
import {
  Star, Calendar, Tag, ShieldCheck, Clock
} from 'lucide-react'
import type { MeasureUnit } from '@/lib/utils'
import { ImageGallery, DimensionsCard, ReviewSection, ImageModal } from './components'

// --- Reusing Types ---
// In a real refactor, these should be in a shared types file
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
  variants: { id: string; name: string; priceMXN: number | null; priceUSD: number | null; priceYEN: number | null; images: { url: string }[] }[]
  reviews: { id: string; rating: number; title: string; description: string; user: { username: string }; images?: { id: string; url: string }[] }[]
}

type UserType = { id: string; measureUnit?: string } | null
type UserFigure = { id: string; status: string } | null

interface DesignProps {
  figure: Figure
  user: UserType
  userFigure: UserFigure
  defaultMeasureUnit?: MeasureUnit
}

export default function FigureDetailClient({
  figure,
  user,
  userFigure,
  defaultMeasureUnit = 'cm'
}: DesignProps) {
  const images = figure.images
  const description = figure.description || ''
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [measureUnit, setMeasureUnit] = useState<MeasureUnit>(
    (user?.measureUnit as MeasureUnit) || defaultMeasureUnit || 'cm'
  )
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="max-w-[1600px] mx-auto px-3 pt-2 pb-4 md:px-4 md:pt-4 md:pb-10">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-8 lg:items-stretch">

        {/* 1. Gallery - Mobile: order-1, Desktop: col 1 */}
        <div className="order-1 lg:col-span-4 xl:col-span-5 lg:row-span-3 flex flex-col max-h-[50vh] lg:max-h-none overflow-hidden">
           <div className="lg:flex-1 flex flex-col">
             <ImageGallery
                images={images}
                figureName={figure.name}
                figureId={figure.id}
                onImageClick={() => setIsModalOpen(true)}
                selectedIndex={selectedImageIndex}
                onIndexChange={setSelectedImageIndex}
              />
           </div>
        </div>

        {/* 2. Name + Rating - Mobile: order-2, Desktop: col 2 row 1 */}
        <div className="order-2 lg:col-span-5 xl:col-span-4">
          <div className="border-b border-white/10 pb-3 lg:pb-4">
            <h1 className="text-xl md:text-3xl font-title font-bold text-white mb-1 md:mb-2 leading-tight">
              {figure.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-4 mt-2 lg:mt-3">
               {figure.reviews.length > 0 ? (
                 <>
                   <div className="flex items-center gap-0.5 text-accent">
                     {Array.from({ length: 5 }).map((_, i) => (
                       <Star key={i} size={16} fill={i < Math.round(figure.reviews.reduce((acc, r) => acc + r.rating, 0) / figure.reviews.length) ? "currentColor" : "none"} className={i < Math.round(figure.reviews.reduce((acc, r) => acc + r.rating, 0) / figure.reviews.length) ? "text-accent" : "text-gray-600"} />
                     ))}
                   </div>
                   <span className="text-sm text-blue-400 hover:underline cursor-pointer">
                     {figure.reviews.length} valoraciones
                   </span>
                 </>
               ) : (
                 <span className="text-sm text-gray-400">
                   Aún no hay valoraciones
                 </span>
               )}
            </div>
          </div>
        </div>

        {/* 3. Buy Box - Mobile: order-3, Desktop: col 3 (spans all rows) */}
        <div className="order-3 lg:col-span-3 lg:row-span-3 flex flex-col">
          <div className="lg:flex-1 flex flex-col">
             <div className="bg-uiBase/50 backdrop-blur-md rounded-xl p-3 lg:p-4 border border-white/10 shadow-2xl lg:flex-1 flex flex-col">

                {/* Brand & Line Info - Compact on mobile */}
                {/* Mobile: inline chips */}
                <div className="lg:hidden mb-3 flex items-center gap-1.5 flex-wrap">
                   <Link href={`/catalog?brandId=${figure.brand.id}`} className="px-2 py-px rounded bg-primary/20 text-primary text-xs font-semibold hover:bg-primary/30 transition-colors">
                      {figure.brand.name}
                   </Link>
                   <span className="text-gray-400 text-base font-bold">›</span>
                   <Link href={`/catalog?lineId=${figure.line.id}`} className="px-2 py-px rounded bg-white/10 text-gray-300 text-xs font-semibold hover:bg-white/20 transition-colors">
                      {figure.line.name}
                   </Link>
                </div>
                {/* Desktop: original layout with labels */}
                <div className="hidden lg:block mb-6 space-y-1">
                   <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs font-medium uppercase w-[60px] flex-shrink-0 text-left">Marca:</span>
                      <Link href={`/catalog?brandId=${figure.brand.id}`} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 hover:bg-primary/20 transition-colors">
                         {figure.brand.name}
                      </Link>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs font-medium uppercase w-[60px] flex-shrink-0 text-left">Línea:</span>
                      <Link href={`/catalog?lineId=${figure.line.id}`} className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/10 hover:bg-white/20 transition-colors">
                         {figure.line.name}
                      </Link>
                   </div>
                </div>

                {/* Price & Release Status - 2 cols on mobile, stacked on desktop */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-0 mb-4 lg:mb-0">
                  {/* Price Section */}
                  <div className="lg:mb-6">
                    <p className="text-xs text-gray-400 font-medium mb-1">Precio</p>
                    <div className="flex items-start gap-0.5 lg:gap-1">
                      <span className="text-[10px] lg:text-sm font-bold text-white mt-0.5 lg:mt-1">$</span>
                      <span className="text-lg lg:text-3xl font-bold text-white">{figure.priceMXN?.toLocaleString() || "---"}</span>
                      <span className="text-[10px] lg:text-sm font-bold text-gray-400 mt-0.5 lg:mt-1">MXN</span>
                    </div>
                    {figure.priceYEN && (
                       <p className="text-[10px] lg:text-xs text-gray-400 lg:text-gray-500 lg:mt-1">¥{figure.priceYEN.toLocaleString()} JPY</p>
                    )}
                  </div>

                  {/* Release Status */}
                  <div className="lg:mb-8">
                     {/* Mobile: etiqueta dinámica + fecha */}
                     <p className="text-xs text-gray-400 font-medium mb-1 lg:hidden">
                        {figure.isReleased ? 'Lanzada en' : 'Fecha de lanzamiento'}
                     </p>
                     {figure.releaseDate && (
                        <div className="flex items-center gap-1.5 text-lg font-bold text-white lg:hidden">
                          {figure.isReleased ? (
                            <ShieldCheck className="w-5 h-5 text-green-400" />
                          ) : (
                            <Clock className="w-5 h-5 text-orange-400" />
                          )}
                          <span>{new Date(figure.releaseDate).toLocaleDateString()}</span>
                        </div>
                     )}
                     {/* Desktop: estado con icono + fecha */}
                     {figure.isReleased ? (
                       <div className="hidden lg:flex items-center gap-2 text-green-400 text-sm font-bold">
                          <ShieldCheck className="w-[18px] h-[18px]" />
                          <span>Disponible / Lanzado</span>
                       </div>
                     ) : (
                       <div className="hidden lg:flex items-center gap-2 text-orange-400 text-sm font-bold">
                          <Calendar className="w-[18px] h-[18px]" />
                          <span>Preventa / Anuncio</span>
                       </div>
                     )}
                     {figure.releaseDate && (
                        <p className="hidden lg:block text-xs text-gray-400 mt-1 ml-6">
                          Fecha: {new Date(figure.releaseDate).toLocaleDateString()}
                        </p>
                     )}
                  </div>
                </div>

                {/* Main CTA */}
                <div className="space-y-3">
                   {user ? (
                     <AddToInventoryButton
                       figureId={figure.id}
                       currentStatus={userFigure?.status || null}
                       userFigureId={userFigure?.id || null}
                       isReleased={figure.isReleased}
                     />
                   ) : (
                     <Link href="/login" className="w-full btn btn-primary py-3 rounded-lg flex justify-center font-bold">
                        Iniciar Sesión para Coleccionar
                     </Link>
                   )}
                </div>

                {/* Series & Character Info */}
                <div className="lg:mt-auto mt-4 pt-3 lg:pt-4 border-t border-white/10 space-y-2">
                   {figure.character ? (
                       <>
                           {figure.character.series && (
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Serie</span>
                                <Link href={`/catalog?seriesId=${figure.character.series.id}`} className="text-blue-400 hover:underline font-medium text-right">
                                   {figure.character.series.name}
                                </Link>
                             </div>
                           )}
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-400">Personaje</span>
                              <Link href={`/catalog?characterId=${figure.character.id}`} className="text-blue-400 hover:underline font-medium text-right">
                                 {figure.character.name}
                              </Link>
                           </div>
                       </>
                   ) : (
                       <div className="flex items-center text-sm text-gray-400">
                           <span className="mr-2">✨</span>
                           Personaje Original
                       </div>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* 4. Dimensions - Mobile: order-4, Desktop: col 2 row 2 */}
        <div className="order-4 lg:col-span-5 xl:col-span-4">
          <DimensionsCard
             heightCm={figure.heightCm}
             widthCm={figure.widthCm}
             depthCm={figure.depthCm}
             measureUnit={measureUnit}
             onToggleUnit={() => setMeasureUnit(u => u === 'cm' ? 'in' : 'cm')}
          />
        </div>

        {/* 5. Technical Specs - Mobile: order-5, Desktop: col 2 row 3 */}
        <div className="order-5 lg:col-span-5 xl:col-span-4">
          <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
             <h3 className="bg-white/10 px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-bold text-white border-b border-white/10">Especificaciones Técnicas</h3>
             <div className="divide-y divide-white/5 text-xs lg:text-sm">
                <div className="grid grid-cols-2 p-2 lg:p-3 hover:bg-white/5">
                   <span className="text-gray-400 font-medium">Fabricante</span>
                   <span className="text-white text-right">{figure.maker || "N/A"}</span>
                </div>
                <div className="grid grid-cols-2 p-2 lg:p-3 hover:bg-white/5">
                   <span className="text-gray-400 font-medium">Material</span>
                   <span className="text-white text-right">{figure.material || "PVC/ABS"}</span>
                </div>
                <div className="grid grid-cols-2 p-2 lg:p-3 hover:bg-white/5">
                   <span className="text-gray-400 font-medium">Escala</span>
                   <span className="text-white text-right">{figure.scale || "Sin escala"}</span>
                </div>
                <div className="grid grid-cols-2 p-2 lg:p-3 hover:bg-white/5">
                   <span className="text-gray-400 font-medium">SKU / ID</span>
                   <span className="text-white text-right font-mono text-xs">{figure.sku || figure.id.slice(0,8)}</span>
                </div>
             </div>
          </div>
        </div>

        {/* 6. Description - Mobile: order-6, Desktop: full width below */}
        <div className="order-6 lg:col-span-12 mt-4 lg:mt-4">
          <section>
             <h2 className="text-base lg:text-xl font-bold text-white mb-2 lg:mb-4 flex items-center gap-2">
               <Tag className="text-primary" size={18} /> Descripción del Producto
             </h2>
             <div className="prose prose-invert prose-sm lg:prose-base max-w-none text-gray-300 text-sm lg:text-base">
                {description.split('\n').map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
             </div>
          </section>
        </div>

        {/* 7. Reviews - Mobile: order-7, Desktop: full width below */}
        <div className="order-7 lg:col-span-12">
          <ReviewSection
            figureId={figure.id}
            reviews={figure.reviews}
            user={user}
            userOwns={userFigure?.status === 'OWNED'}
          />
        </div>

      </div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={images[selectedImageIndex]?.url || ''}
        imageName={figure.name}
        onPrev={() => setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
        onNext={() => setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
      />
    </div>
  )
}
