'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, Info } from 'lucide-react'

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-6 text-left group"
      >
        <span className="text-lg font-medium text-white group-hover:text-primary transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`text-gray-500 group-hover:text-primary transition-colors`}
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-gray-400 pb-6 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section - Moved from Home */}
      <motion.section
        className="relative py-24 md:py-32 text-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-title text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
              Figura<span className="text-primary">Collect</span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-body text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            La plataforma definitiva para coleccionistas de figuras. <br className="hidden md:block" />
            Descubre lanzamientos, organiza tu colección y conecta con tu pasión.
          </motion.p>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-uiBase rounded-lg border border-white/5 text-primary">
            <HelpCircle size={24} />
          </div>
          <h2 className="text-3xl font-title font-bold text-white">Preguntas Frecuentes</h2>
        </div>

        <div className="bg-uiBase/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 md:p-8">
          <FaqItem 
            question="¿Qué es FiguraCollect?" 
            answer="FiguraCollect es una plataforma diseñada por y para coleccionistas. Nuestro objetivo es ofrecerte una base de datos completa y herramientas para gestionar tu colección de figuras de manera sencilla y visual." 
          />
          <FaqItem 
            question="¿Cómo puedo añadir figuras a mi colección?" 
            answer="Simplemente navega por el catálogo, encuentra la figura que posees y haz clic en el botón 'Añadir a colección'. Podrás especificar el estado (pre-order, en mano, etc.) y otros detalles." 
          />
          <FaqItem 
            question="¿Es gratis usar la plataforma?" 
            answer="Sí, las funcionalidades básicas de búsqueda, creación de listas y gestión de colección son completamente gratuitas para todos los usuarios registrados." 
          />
          <FaqItem 
            question="¿Puedo contribuir a la base de datos?" 
            answer="Actualmente, la base de datos es gestionada por nuestros administradores para garantizar la calidad de la información. Sin embargo, estamos trabajando en un sistema de sugerencias para que la comunidad pueda aportar." 
          />
          <FaqItem 
            question="¿Cómo funcionan las listas?" 
            answer="Puedes crear listas personalizadas (por ejemplo: 'Mis Grails', 'Wishlist 2025') para organizar figuras. Estas listas pueden ser públicas para compartir con la comunidad o privadas para tu uso personal." 
          />
        </div>
      </section>
    </div>
  )
}
