'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { AddToInventoryButton } from '@/components/AddToInventoryButton'
import { 
  Star, ChevronLeft, ChevronRight, UserCircle, ZoomIn, ZoomOut, RotateCcw, X, 
  Calendar, Box, Ruler, Scale, Factory, Tag, Layers
} from 'lucide-react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

// --- Types ---
type Figure = {
  id: string; name: string; description: string | null; sku: string | null; size: string | null; scale: string | null; material: string | null; maker: string | null; releaseDate: string | null; isReleased: boolean; priceMXN: number | null; priceUSD: number | null; priceYEN: number | null; brand: { id: string; name: string; }; line: { id: string; name: string; }; images: { id: string; url: string; }[]; tags: { tag: { name: string; }; }[]; series: { series: { id: string; name: string } }[], variants: { id: string; name: string; priceMXN: number | null; images: { url: string; }[]; }[]; reviews: { id: string; rating: number; title: string; description: string; user: { username: string; }; }[];
}
type User = { id: string } | null
type UserFigure = { id: string, status: string } | null

interface FigureDetailClientProps {
  figure: Figure
  user: User
  userFigure: UserFigure
}

// --- DEMO DATA FOR VISUALIZATION ---
// Used to show how the layout behaves with rich content as requested
const DEMO_IMAGES = [
  { id: 'd1', url: 'https://tamashiiweb.com/images/item/item_0000015043_4WRsFsBU_01.jpg' },
  { id: 'd2', url: 'https://tamashiiweb.com/images/item/item_0000015043_NKroScjk_03.jpg' },
  { id: 'd3', url: 'https://tamashiiweb.com/images/item/item_0000015043_NKroScjk_05.jpg' },
  { id: 'd4', url: 'https://tamashiiweb.com/images/item/item_0000015043_NKroScjk_08.jpg' },
  { id: 'd5', url: 'https://tamashiiweb.com/images/item/item_0000015043_NKroScjk_09.jpg' },
  { id: 'd6', url: 'https://tamashiiweb.com/images/item/item_0000015043_NKroScjk_10.jpg' },
  { id: 'd7', url: 'https://tamashiiweb.com/images/item/item_0000015043_NKroScjk_13.jpg' },
]

const DEMO_VARIANTS = [
  { id: 'v1', name: 'Edición Normal', priceMXN: 1200, images: [{ url: DEMO_IMAGES[0].url }] },
  { id: 'v2', name: 'Edición Limitada (Glow)', priceMXN: 1800, images: [{ url: DEMO_IMAGES[1].url }] },
  { id: 'v3', name: 'Repaint Version', priceMXN: 1500, images: [{ url: DEMO_IMAGES[5].url }] },
]

const LONG_DESCRIPTION =
  "Esta figura captura la esencia del personaje con un nivel de detalle impresionante. Esculpida meticulosamente para representar fielmente su aparición en el arco final de la serie, cuenta con más de 30 puntos de articulación que permiten recrear cualquier pose de batalla icónica.\n\n" +
  "El acabado de pintura utiliza técnicas de sombreado multicapa para resaltar la musculatura y los pliegues de la ropa, dando una sensación de realismo y profundidad única en esta escala. Los accesorios incluidos son abundantes: tres rostros intercambiables (serio, grito de batalla, sonrisa confiada), cinco pares de manos y su arma característica con efectos de energía translúcidos.\n\n" +
  "Fabricada en PVC y ABS de alta calidad, esta pieza no solo es duradera sino que mantiene su integridad visual a lo largo del tiempo. Es una adición obligada para cualquier coleccionista serio que busque la representación definitiva de este héroe. La base incluida cuenta con un brazo articulado para poses aéreas dinámicas.\n\n" +
  "Nota: Esta figura es una edición de producción limitada.";

// --- Components ---

const InfoBadge = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | null }) => {
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

export default function FigureDetailClient({ figure, user, userFigure }: FigureDetailClientProps) {
  // USE DEMO DATA if figure has no images, just for visualization purposes as requested
  const useDemo = figure.images.length === 0;
  
  const images = useDemo ? DEMO_IMAGES : figure.images
  const description = useDemo ? LONG_DESCRIPTION : (figure.description || "Sin descripción.")
  const variants = useDemo ? DEMO_VARIANTS : figure.variants

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  
  const selectedImage = images[selectedImageIndex]

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevImage()
      if (e.key === 'ArrowRight') handleNextImage()
      if (e.key === 'Escape') setIsImageModalOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [images.length])

  const avgRating = figure.reviews.length > 0
    ? (figure.reviews.reduce((sum, r) => sum + r.rating, 0) / figure.reviews.length).toFixed(1)
    : null

  return (
    <div className="min-h-screen pb-20 relative bg-background">
      
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

      <div className="relative z-30 max-w-7xl mx-auto px-4 pt-4 lg:pt-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Visuals (7 cols) - SCROLLABLE */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Main Image Viewer */}
            <div className="space-y-4">
                <motion.div 
                layoutId={`main-image-${figure.id}`}
                className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-uiBase/30 group cursor-zoom-in"
                onClick={() => setIsImageModalOpen(true)}
                >
                <AnimatePresence mode="wait">
                    <motion.img
                    key={selectedImage.url}
                    src={selectedImage.url}
                    alt={figure.name}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-contain p-2 md:p-6"
                    />
                </AnimatePresence>

                {/* Hover Navigation Arrows */}
                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <button 
                    onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                    className="p-3 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-primary hover:text-white transition-all pointer-events-auto transform hover:-translate-x-1"
                    >
                    <ChevronLeft size={24} />
                    </button>
                    <button 
                    onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                    className="p-3 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-primary hover:text-white transition-all pointer-events-auto transform hover:translate-x-1"
                    >
                    <ChevronRight size={24} />
                    </button>
                </div>
                
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full pointer-events-none font-medium border border-white/10">
                    {selectedImageIndex + 1} / {images.length}
                </div>
                </motion.div>

                {/* Thumbnail Strip - "Carrusel" */}
                <div className="relative group">
                    <div className="flex gap-3 overflow-x-auto pb-4 pt-2 custom-scrollbar snap-x">
                        {images.map((img, idx) => (
                        <button
                            key={img.id}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all snap-start ${selectedImageIndex === idx 
                                ? 'border-primary shadow-[0_0_15px_-3px_rgba(225,6,44,0.5)] scale-100 ring-2 ring-primary/30' 
                                : 'border-white/10 hover:border-white/40 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}`}
                        >
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Description Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-uiBase/40 backdrop-blur-md rounded-3xl p-8 border border-white/5"
            >
              <h3 className="text-xl font-title font-bold text-white mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                <Tag size={22} className="text-primary" /> Descripción Detallada
              </h3>
              <div className="prose prose-invert prose-lg prose-p:text-gray-300 prose-p:leading-relaxed max-w-none font-body">
                {/* Rendering text with line breaks handled properly */}
                {description.split('\n').map((paragraph, i) => (
                    paragraph.trim() && <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </motion.div>

            {/* Reviews Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-uiBase/40 backdrop-blur-md rounded-3xl p-8 border border-white/5"
            >
              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <h3 className="text-xl font-title font-bold text-white flex items-center gap-3">
                  <Star size={22} className="text-primary" /> Opiniones de la Comunidad
                </h3>
                {avgRating && (
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/5">
                    <span className="font-bold text-white text-xl">{avgRating}</span>
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">/ 5.0</span>
                  </div>
                )}
              </div>
              
              {figure.reviews.length > 0 ? (
                <div className="grid gap-6">
                  {figure.reviews.map(r => (
                    <div key={r.id} className="bg-black/20 rounded-2xl p-6 hover:bg-black/30 transition-colors border border-white/5">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-full bg-uiBase flex items-center justify-center text-primary border border-white/10 shadow-inner">
                             <UserCircle size={28} />
                           </div>
                           <div>
                             <p className="font-bold text-white text-base">{r.user.username}</p>
                             <div className="flex text-accent gap-0.5 mt-1">
                               {[...Array(5)].map((_, i) => (
                                 <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "text-accent" : "text-gray-700"} />
                               ))}
                             </div>
                           </div>
                         </div>
                         <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">Verificado</span>
                      </div>
                      <h4 className="font-bold text-white text-lg mb-2">{r.title}</h4>
                      <p className="text-gray-400 text-base leading-relaxed">{r.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-black/20 rounded-2xl border border-dashed border-white/10">
                    <Star className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-400 italic">Aún no hay opiniones. ¡Sé el primero en opinar!</p>
                </div>
              )}
            </motion.div>

          </div>

          {/* Right Column: Info & Actions (5 cols) - STICKY */}
          <div className="lg:col-span-5 relative h-full">
            <div className="lg:sticky lg:top-28 space-y-8">
              
              {/* Main Info Block */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-uiBase/30 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl"
              >
                {/* Breadcrumbs / Categories */}
                <div className="flex flex-wrap gap-2 mb-6">
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

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-title font-black text-white leading-[1.1] mb-4 text-balance">
                  {figure.name}
                </h1>
                
                <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
                    <div className="flex items-center gap-4 text-gray-400">
                    {figure.releaseDate && (
                        <span className="flex items-center gap-2 text-sm font-medium bg-white/5 px-3 py-1 rounded-md">
                        <Calendar size={16} className="text-accent" />
                        {new Date(figure.releaseDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })}
                        </span>
                    )}
                    {!figure.isReleased && (
                        <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded uppercase border border-blue-500/30 tracking-wide">
                        Por Lanzar
                        </span>
                    )}
                    </div>
                    {/* Share or Like could go here */}
                </div>

                {/* Price Area */}
                {figure.priceMXN && (
                  <div className="mb-8">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wider">Precio Estimado</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-title font-bold text-white tracking-tight">
                        ${figure.priceMXN.toLocaleString()}
                        </span>
                        <span className="text-xl text-gray-500 font-medium">MXN</span>
                    </div>
                  </div>
                )}

                {/* VARIANTS SECTION - MOVED HERE */}
                {variants.length > 0 && (
                    <div className="mb-8">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-3 tracking-wider flex items-center gap-2">
                            <Layers size={14} /> Variantes Disponibles
                        </p>
                        <div className="grid gap-3">
                            {variants.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariantId(selectedVariantId === v.id ? null : v.id)}
                                    className={`flex items-center gap-3 p-2 pr-4 rounded-xl border transition-all text-left w-full group ${selectedVariantId === v.id 
                                        ? 'bg-primary/10 border-primary ring-1 ring-primary' 
                                        : 'bg-black/20 border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                                >
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-uiBase flex-shrink-0">
                                        <img src={v.images[0]?.url} alt={v.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className={`text-sm font-bold transition-colors ${selectedVariantId === v.id ? 'text-primary' : 'text-white group-hover:text-primary'}`}>
                                            {v.name}
                                        </p>
                                        {v.priceMXN && (
                                            <p className="text-xs text-gray-400">${v.priceMXN.toLocaleString()} MXN</p>
                                        )}
                                    </div>
                                    {selectedVariantId === v.id && (
                                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(225,6,44,0.8)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                   {user ? (
                     <>
                        <div className="bg-white/5 p-2 rounded-2xl border border-white/10">
                            <AddToInventoryButton 
                            figureId={figure.id} 
                            currentStatus={userFigure?.status || null} 
                            userFigureId={userFigure?.id || null} 
                            />
                        </div>
                        {/* Placeholder for wishlist or other actions */}
                     </>
                   ) : (
                     <Link 
                       href="/login" 
                       className="block w-full py-4 bg-primary hover:bg-primary/90 text-center rounded-xl text-white font-bold transition-all shadow-lg shadow-primary/20"
                     >
                       Inicia sesión para coleccionar
                     </Link>
                   )}
                </div>

              </motion.div>
              
              {/* Specs Grid - Sticky as well */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="grid grid-cols-2 gap-3"
              >
                   <InfoBadge icon={Scale} label="Escala" value={figure.scale || 'N/A'} />
                   <InfoBadge icon={Ruler} label="Tamaño" value={figure.size || 'N/A'} />
                   <InfoBadge icon={Box} label="Material" value={figure.material || 'N/A'} />
                   <InfoBadge icon={Factory} label="Fabricante" value={figure.maker || 'N/A'} />
                   <InfoBadge icon={Tag} label="SKU" value={figure.sku || 'N/A'} />
              </motion.div>

            </div>
          </div>

        </div>
      </div>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setIsImageModalOpen(false)}
          >
            <button className="absolute top-6 right-6 text-white/50 hover:text-white p-2 z-50">
              <X size={32} />
            </button>

            <div className="w-full h-full p-4 md:p-10 flex items-center justify-center relative" onClick={e => e.stopPropagation()}>
               <TransformWrapper>
                  <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                    <img 
                      src={selectedImage.url} 
                      alt={figure.name} 
                      className="max-w-full max-h-full object-contain"
                    />
                  </TransformComponent>
               </TransformWrapper>

               {/* Modal Navigation */}
               <button 
                 className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                 onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
               >
                 <ChevronLeft size={40} />
               </button>
               <button 
                 className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                 onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
               >
                 <ChevronRight size={40} />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
