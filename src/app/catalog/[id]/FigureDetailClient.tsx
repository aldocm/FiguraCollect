'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { AddToInventoryButton } from '@/components/AddToInventoryButton'
import {
  Star, ChevronLeft, ChevronRight, UserCircle, ZoomIn, ZoomOut, RotateCcw, X,
  Calendar, Box, Ruler, Scale, Factory, Tag, Layers, ArrowLeftRight, Plus, Send, ImagePlus, Trash2, MessageSquarePlus, ChevronDown, ChevronUp, User
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDimensions, type MeasureUnit } from '@/lib/utils'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

// --- Types ---
type Figure = {
  id: string; name: string; description: string | null; sku: string | null; heightCm: number | null; widthCm: number | null; depthCm: number | null; scale: string | null; material: string | null; maker: string | null; releaseDate: string | null; isReleased: boolean; priceMXN: number | null; priceUSD: number | null; priceYEN: number | null; brand: { id: string; name: string; }; line: { id: string; name: string; }; character?: { id: string; name: string; series?: { id: string; name: string } | null } | null; images: { id: string; url: string; }[]; tags: { tag: { name: string; }; }[]; series: { series: { id: string; name: string } }[], variants: { id: string; name: string; priceMXN: number | null; images: { url: string; }[]; }[]; reviews: { id: string; rating: number; title: string; description: string; user: { username: string; }; images?: { id: string; url: string; }[]; }[];
}
type User = { id: string; measureUnit?: string } | null
type UserFigure = { id: string, status: string } | null

interface FigureDetailClientProps {
  figure: Figure
  user: User
  userFigure: UserFigure
  defaultMeasureUnit?: MeasureUnit
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

export default function FigureDetailClient({ figure, user, userFigure, defaultMeasureUnit = 'cm' }: FigureDetailClientProps) {
  // USE DEMO DATA if figure has no images, just for visualization purposes as requested
  const useDemo = figure.images.length === 0;

  const images = useDemo ? DEMO_IMAGES : figure.images
  const description = useDemo ? LONG_DESCRIPTION : (figure.description || "Sin descripción.")
  const variants = useDemo ? DEMO_VARIANTS : figure.variants

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  // Measure unit state - defaults to user preference or 'cm'
  const [measureUnit, setMeasureUnit] = useState<MeasureUnit>(
    (user?.measureUnit as MeasureUnit) || defaultMeasureUnit
  )

  // Review form state
  const router = useRouter()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    description: '',
    images: [] as string[]
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')

  // Check if user can review (must own the figure and not have reviewed yet)
  const canReview = user && userFigure?.status === 'OWNED' && !figure.reviews.some(r => r.user.username === user.id)
  const hasAlreadyReviewed = user && figure.reviews.some(r => r.user.username === user.id)

  const handleSubmitReview = async () => {
    if (!reviewForm.title.trim() || !reviewForm.description.trim()) {
      setReviewError('Título y descripción son requeridos')
      return
    }

    setSubmittingReview(true)
    setReviewError('')

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          figureId: figure.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          description: reviewForm.description,
          images: reviewForm.images
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setReviewError(data.error || 'Error al enviar la opinión')
        return
      }

      // Reset form and refresh
      setReviewForm({ rating: 5, title: '', description: '', images: [] })
      setShowReviewForm(false)
      router.refresh()
    } catch (e) {
      setReviewError('Error de conexión')
    } finally {
      setSubmittingReview(false)
    }
  }

  const addImageUrl = () => {
    if (reviewForm.images.length < 3) {
      const url = prompt('Ingresa la URL de la imagen:')
      if (url && url.trim()) {
        setReviewForm(f => ({ ...f, images: [...f.images, url.trim()] }))
      }
    }
  }

  const removeImage = (index: number) => {
    setReviewForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }))
  }

  // State for viewing review images
  const [reviewImageModal, setReviewImageModal] = useState<string | null>(null)

  // State for collapsed reviews (stores IDs of collapsed reviews)
  const [collapsedReviews, setCollapsedReviews] = useState<Set<string>>(new Set())

  const toggleReviewCollapse = (reviewId: string) => {
    setCollapsedReviews(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId)
      } else {
        newSet.add(reviewId)
      }
      return newSet
    })
  }

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

      <div className="relative z-30 max-w-8xl mx-auto px-2 md:px-2 pt-1 md:pt-4 lg:pt-8">

        {/* Main Grid - Reordered for mobile */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* Images Section - Mobile: 1st */}
          <div className="order-1 lg:col-span-7 lg:row-start-1 w-full">
            
            {/* Main Image Viewer */}
            <div className="space-y-2 md:space-y-4">
                <motion.div
                layoutId={`main-image-${figure.id}`}
                className="relative aspect-square md:aspect-square lg:aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-uiBase/30 group cursor-zoom-in"
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
                    {selectedImageIndex + 1} / {images.length}
                </div>
                </motion.div>

                {/* Thumbnail Strip - "Carrusel" */}
                <div className="relative group">
                    <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-4 pt-1 md:pt-2 custom-scrollbar snap-x">
                        {images.map((img, idx) => (
                        <button
                            key={img.id}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`relative flex-shrink-0 w-14 h-14 md:w-24 md:h-24 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all snap-start ${selectedImageIndex === idx
                                ? 'border-primary shadow-[0_0_15px_-3px_rgba(225,6,44,0.5)] scale-100 ring-2 ring-primary/30'
                                : 'border-white/10 hover:border-white/40 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}`}
                        >
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </button>
                        ))}
                    </div>
                </div>
            </div>
          </div>

          {/* Info & Specs Section - Mobile: 2nd, Desktop: right column sticky */}
          <div className="order-2 lg:col-span-5 lg:row-start-1 lg:row-end-4 w-full">
            <div className="lg:sticky lg:top-28 space-y-6 lg:space-y-8">

              {/* Main Info Block */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-uiBase/30 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 md:p-6 border border-white/10 shadow-2xl"
              >
                {/* Breadcrumbs / Categories */}
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
                        {new Date(figure.releaseDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })}
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
                        <span className="text-gray-500 text-xs">
                            ({figure.reviews.length})
                        </span>
                        </span>
                    )}
                    </div>
                </div>

                {/* Price Area */}
                {figure.priceMXN && (
                  <div>
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
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5 tracking-wider mt-3 lg:mt-4 text-center">Precio de Lanzamiento</p>
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
                {/* Dimensions with toggle */}
                {(figure.heightCm || figure.widthCm || figure.depthCm) && (() => {
                  const onlyHeight = figure.heightCm && !figure.widthCm && !figure.depthCm
                  const cmToIn = (cm: number) => (cm * 0.393701).toFixed(2)

                  return (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 lg:p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2 lg:mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 lg:p-2 rounded-full bg-primary/20 text-primary">
                            <Ruler size={16} />
                          </div>
                          <p className="text-[10px] lg:text-xs text-gray-400 uppercase font-bold tracking-wider">
                            {onlyHeight ? 'Tamaño' : 'Dimensiones'}
                          </p>
                        </div>
                        <button
                          onClick={() => setMeasureUnit(measureUnit === 'cm' ? 'in' : 'cm')}
                          className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                          title="Cambiar unidad de medida"
                        >
                          <ArrowLeftRight size={12} />
                          {measureUnit === 'cm' ? 'cm' : 'in'}
                        </button>
                      </div>

                      {onlyHeight ? (
                        <div className="bg-black/20 rounded-lg p-3 lg:p-4 text-center">
                          <p className="text-[10px] text-gray-500 uppercase mb-1">Altura</p>
                          <p className="text-xl lg:text-2xl text-white font-bold">
                            {measureUnit === 'cm' ? figure.heightCm : cmToIn(figure.heightCm)}
                            <span className="text-sm lg:text-base text-gray-400 font-normal ml-1">
                              {measureUnit}
                            </span>
                          </p>
                        </div>
                      ) : (() => {
                        const dimCount = [figure.heightCm, figure.widthCm, figure.depthCm].filter(Boolean).length
                        const gridCols = dimCount === 2 ? 'grid-cols-2' : 'grid-cols-3'

                        return (
                          <div className={`grid ${gridCols} gap-2 text-center`}>
                            {figure.heightCm && (
                              <div className="bg-black/20 rounded-lg p-2 lg:p-3">
                                <p className="text-[10px] text-gray-500 uppercase">Alto</p>
                                <p className="text-base lg:text-lg text-white font-bold">
                                  {measureUnit === 'cm' ? figure.heightCm : cmToIn(figure.heightCm)}
                                  <span className="text-xs text-gray-400 font-normal ml-1">{measureUnit}</span>
                                </p>
                              </div>
                            )}
                            {figure.widthCm && (
                              <div className="bg-black/20 rounded-lg p-2 lg:p-3">
                                <p className="text-[10px] text-gray-500 uppercase">Ancho</p>
                                <p className="text-base lg:text-lg text-white font-bold">
                                  {measureUnit === 'cm' ? figure.widthCm : cmToIn(figure.widthCm)}
                                  <span className="text-xs text-gray-400 font-normal ml-1">{measureUnit}</span>
                                </p>
                              </div>
                            )}
                            {figure.depthCm && (
                              <div className="bg-black/20 rounded-lg p-2 lg:p-3">
                                <p className="text-[10px] text-gray-500 uppercase">Prof.</p>
                                <p className="text-base lg:text-lg text-white font-bold">
                                  {measureUnit === 'cm' ? figure.depthCm : cmToIn(figure.depthCm)}
                                  <span className="text-xs text-gray-400 font-normal ml-1">{measureUnit}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )
                })()}

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

                {/* Other specs grid */}
                <div className="grid grid-cols-2 gap-2 lg:gap-3">
                  <InfoBadge icon={Scale} label="Escala" value={figure.scale || null} />
                  <InfoBadge icon={Box} label="Material" value={figure.material || null} />
                  <InfoBadge icon={Factory} label="Fabricante" value={figure.maker || null} />
                  <InfoBadge icon={Tag} label="SKU" value={figure.sku || null} />
                </div>
              </motion.div>

            </div>
          </div>

          {/* Description Section - Mobile: 3rd */}
          <div className="order-3 lg:col-span-7 lg:row-start-2 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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

          {/* Reviews Section - Mobile: 4th */}
          <div className="order-4 lg:col-span-7 lg:row-start-3 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-uiBase/40 backdrop-blur-md rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-white/5"
            >
              <div className="flex items-center justify-between mb-4 lg:mb-8 border-b border-white/10 pb-3 lg:pb-4">
                <h3 className="text-base lg:text-xl font-title font-bold text-white flex items-center gap-2 lg:gap-3">
                  <Star size={18} className="text-primary" /> Opiniones de la Comunidad
                </h3>
                {avgRating && (
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/5">
                    <span className="font-bold text-white text-xl">{avgRating}</span>
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">/ 5.0</span>
                  </div>
                )}
              </div>
              
              {/* Review Form */}
              <AnimatePresence>
                {showReviewForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-primary/10 to-accent/5 rounded-2xl p-6 border border-primary/20">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-white flex items-center gap-2">
                          <MessageSquarePlus size={18} className="text-primary" />
                          Escribe tu opinión
                        </h4>
                        <button
                          onClick={() => setShowReviewForm(false)}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      {/* Rating */}
                      <div className="mb-4">
                        <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 block">Calificación</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                              className="p-1 transition-transform hover:scale-110"
                            >
                              <Star
                                size={28}
                                fill={star <= reviewForm.rating ? "currentColor" : "none"}
                                className={star <= reviewForm.rating ? "text-accent" : "text-gray-600"}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Title */}
                      <div className="mb-4">
                        <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 block">Título</label>
                        <input
                          type="text"
                          value={reviewForm.title}
                          onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                          placeholder="Ej: ¡Increíble calidad de detalle!"
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                          maxLength={100}
                        />
                      </div>

                      {/* Description */}
                      <div className="mb-4">
                        <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 block">Tu opinión</label>
                        <textarea
                          value={reviewForm.description}
                          onChange={e => setReviewForm(f => ({ ...f, description: e.target.value }))}
                          placeholder="Cuéntanos qué te parece esta figura, la calidad, los detalles, si cumplió tus expectativas..."
                          rows={4}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                          maxLength={1000}
                        />
                      </div>

                      {/* Images */}
                      <div className="mb-4">
                        <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 block">
                          Imágenes <span className="text-gray-500 font-normal">(opcional, máx. 3)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {reviewForm.images.map((url, idx) => (
                            <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 group">
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              <button
                                onClick={() => removeImage(idx)}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={18} className="text-red-400" />
                              </button>
                            </div>
                          ))}
                          {reviewForm.images.length < 3 && (
                            <button
                              type="button"
                              onClick={addImageUrl}
                              className="w-20 h-20 rounded-lg border-2 border-dashed border-white/20 hover:border-primary/50 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                            >
                              <ImagePlus size={24} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Error */}
                      {reviewError && (
                        <p className="text-red-400 text-sm mb-4">{reviewError}</p>
                      )}

                      {/* Submit */}
                      <button
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {submittingReview ? (
                          'Enviando...'
                        ) : (
                          <>
                            <Send size={18} />
                            Publicar Opinión
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add Review Button */}
              {!showReviewForm && user && userFigure?.status === 'OWNED' && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full mb-6 py-4 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/30 rounded-2xl text-gray-400 hover:text-white font-bold transition-all flex items-center justify-center gap-2 group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                  Escribir una opinión
                </button>
              )}

              {/* Message for users who don't own the figure */}
              {!showReviewForm && user && userFigure?.status !== 'OWNED' && (
                <div className="mb-6 py-4 px-5 bg-white/5 border border-white/10 rounded-2xl text-center">
                  <p className="text-gray-400 text-sm">
                    <span className="text-primary font-bold">¿Tienes esta figura?</span> Agrégala a tu colección para poder opinar.
                  </p>
                </div>
              )}

              {/* Message for non-logged users - small and discreet */}
              {!showReviewForm && !user && (
                <div className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <span>¿Quieres opinar?</span>
                  <Link
                    href="/login"
                    className="text-primary hover:text-primary/80 hover:underline transition-colors"
                  >
                    Inicia sesión
                  </Link>
                </div>
              )}

              {/* Reviews List */}
              {figure.reviews.length > 0 ? (
                <div className="grid gap-4">
                  {figure.reviews.map(r => {
                    const isCollapsed = collapsedReviews.has(r.id)

                    return (
                      <div key={r.id} className="bg-black/20 rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors">
                        {/* Header - Always visible, clickable to toggle */}
                        <button
                          onClick={() => toggleReviewCollapse(r.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-uiBase flex items-center justify-center text-primary border border-white/10">
                              <UserCircle size={22} />
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-white text-sm">{r.user.username}</p>
                              <div className="flex text-accent gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={12} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "text-accent" : "text-gray-700"} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">Verificado</span>
                            {isCollapsed ? (
                              <ChevronDown size={18} className="text-gray-500" />
                            ) : (
                              <ChevronUp size={18} className="text-gray-500" />
                            )}
                          </div>
                        </button>

                        {/* Content - Collapsible */}
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-0">
                                <div className="border-t border-white/5 pt-4">
                                  <h4 className="font-bold text-white text-lg mb-2">{r.title}</h4>
                                  <p className="text-gray-400 text-base leading-relaxed">{r.description}</p>

                                  {/* Review Images */}
                                  {r.images && r.images.length > 0 && (
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                                      {r.images.map((img) => (
                                        <button
                                          key={img.id}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setReviewImageModal(img.url)
                                          }}
                                          className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-colors group relative"
                                        >
                                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <ZoomIn size={16} className="text-white" />
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              ) : !showReviewForm ? (
                <div className="text-center py-12 bg-black/20 rounded-2xl border border-dashed border-white/10">
                    <Star className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-400 italic mb-2">Aún no hay opiniones.</p>
                    {user && userFigure?.status === 'OWNED' && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="text-primary hover:text-primary/80 font-bold text-sm"
                      >
                        ¡Sé el primero en opinar!
                      </button>
                    )}
                </div>
              ) : null}
            </motion.div>
          </div>

        </div>
      </div>

      {/* Full Screen Modal - Figure Images */}
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

      {/* Review Image Modal */}
      <AnimatePresence>
        {reviewImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setReviewImageModal(null)}
          >
            <button className="absolute top-6 right-6 text-white/50 hover:text-white p-2 z-50">
              <X size={32} />
            </button>

            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={reviewImageModal}
              alt="Imagen de opinión"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
