'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, UserCircle, X, Plus, Send, ImagePlus, Trash2,
  MessageSquarePlus, ChevronDown, ChevronUp, ZoomIn
} from 'lucide-react'
import { ReviewImageModal } from './ImageModal'

// Types
interface Review {
  id: string
  rating: number
  title: string
  description: string
  user: { username: string }
  images?: { id: string; url: string }[]
}

interface ReviewSectionProps {
  figureId: string
  reviews: Review[]
  user: { id: string } | null
  userOwns: boolean
}

// --- Review Form ---
function ReviewForm({
  figureId,
  onClose,
  onSuccess
}: {
  figureId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    rating: 5,
    title: '',
    description: '',
    images: [] as string[]
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Título y descripción son requeridos')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          figureId,
          rating: form.rating,
          title: form.title,
          description: form.description,
          images: form.images
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al enviar la opinión')
        return
      }

      onSuccess()
    } catch {
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  const addImageUrl = () => {
    if (form.images.length < 3) {
      const url = prompt('Ingresa la URL de la imagen:')
      if (url?.trim()) {
        setForm(f => ({ ...f, images: [...f.images, url.trim()] }))
      }
    }
  }

  const removeImage = (index: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }))
  }

  return (
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
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Rating */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 block">
            Calificación
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setForm(f => ({ ...f, rating: star }))}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  fill={star <= form.rating ? "currentColor" : "none"}
                  className={star <= form.rating ? "text-accent" : "text-gray-600"}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 block">
            Título
          </label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Ej: ¡Increíble calidad de detalle!"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 block">
            Tu opinión
          </label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
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
            {form.images.map((url, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 group">
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} className="text-red-400" />
                </button>
              </div>
            ))}
            {form.images.length < 3 && (
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
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
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
  )
}

// --- Review Card ---
function ReviewCard({
  review,
  onImageClick
}: {
  review: Review
  onImageClick: (url: string) => void
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="bg-black/20 rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors">
      {/* Header - Always visible, clickable to toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-uiBase flex items-center justify-center text-primary border border-white/10">
            <UserCircle size={22} />
          </div>
          <div className="text-left">
            <p className="font-bold text-white text-sm">{review.user.username}</p>
            <div className="flex text-accent gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < review.rating ? "currentColor" : "none"}
                  className={i < review.rating ? "text-accent" : "text-gray-700"}
                />
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
                <h4 className="font-bold text-white text-lg mb-2">{review.title}</h4>
                <p className="text-gray-400 text-base leading-relaxed">{review.description}</p>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                    {review.images.map((img) => (
                      <button
                        key={img.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onImageClick(img.url)
                        }}
                        className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-colors group relative"
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
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
}

// --- Main Review Section ---
export function ReviewSection({ figureId, reviews, user, userOwns }: ReviewSectionProps) {
  const router = useRouter()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewImageModal, setReviewImageModal] = useState<string | null>(null)

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const handleReviewSuccess = useCallback(() => {
    setShowReviewForm(false)
    router.refresh()
  }, [router])

  return (
    <>
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
            <ReviewForm
              figureId={figureId}
              onClose={() => setShowReviewForm(false)}
              onSuccess={handleReviewSuccess}
            />
          )}
        </AnimatePresence>

        {/* Add Review Button */}
        {!showReviewForm && user && userOwns && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="w-full mb-6 py-4 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/30 rounded-2xl text-gray-400 hover:text-white font-bold transition-all flex items-center justify-center gap-2 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Escribir una opinión
          </button>
        )}

        {/* Message for users who don't own the figure */}
        {!showReviewForm && user && !userOwns && (
          <div className="mb-6 py-4 px-5 bg-white/5 border border-white/10 rounded-2xl text-center">
            <p className="text-gray-400 text-sm">
              <span className="text-primary font-bold">¿Tienes esta figura?</span> Agrégala a tu colección para poder opinar.
            </p>
          </div>
        )}

        {/* Message for non-logged users */}
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
        {reviews.length > 0 ? (
          <div className="grid gap-4">
            {reviews.map(r => (
              <ReviewCard
                key={r.id}
                review={r}
                onImageClick={setReviewImageModal}
              />
            ))}
          </div>
        ) : !showReviewForm ? (
          <div className="text-center py-12 bg-black/20 rounded-2xl border border-dashed border-white/10">
            <Star className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 italic mb-2">Aún no hay opiniones.</p>
            {user && userOwns && (
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

      {/* Review Image Modal */}
      <ReviewImageModal
        imageUrl={reviewImageModal}
        onClose={() => setReviewImageModal(null)}
      />
    </>
  )
}
