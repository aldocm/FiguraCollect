'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Ghost, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex-1 bg-background flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-blue-500/5 rounded-full blur-[140px] animate-pulse-slow-reverse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
        className="relative z-10 bg-uiBase/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl max-w-lg mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 150, delay: 0.4 }}
          className="inline-flex p-6 rounded-full bg-primary/20 text-primary mb-6"
        >
          <Ghost size={64} strokeWidth={1.5} />
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-title font-black text-white mb-4 leading-tight">
          404 <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">No Encontrado</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mb-8">
          ¡Ups! Parece que la figura o página que buscabas se ha desvanecido en la colección.
          No te preocupes, no hay figuras perdidas para siempre.
        </p>
        
        <Link href="/catalog" passHref>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30"
          >
            <ArrowLeft size={20} />
            Volver al Catálogo
          </motion.button>
        </Link>
      </motion.div>
    </div>
  )
}
