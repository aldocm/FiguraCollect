'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { LayoutGrid, Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react'
import FigureCard from '@/components/FigureCard'

// --- TYPES ---
// These should match what we return from page.tsx
type FigureData = {
  id: string
  name: string
  isReleased: boolean
  releaseDate: string | null
  priceMXN: number | null
  priceUSD: number | null
  priceYEN: number | null
  originalPriceCurrency: string | null
  brand: { name: string }
  line?: { name: string }
  images: { url: string }[]
  averageRating: number
}

type HomeSectionData = {
  id: string
  title: string
  type: string
  viewAllUrl: string | null
  data: FigureData[]
}

interface HomePageClientProps {
  sections: HomeSectionData[]
}

// --- ANIMATIONS ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const figureContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
}

export default function HomePageClient({ sections }: HomePageClientProps) {

  const navCards = [
    {
      title: "Catálogo Completo",
      desc: "Explora todas las figuras, filtralas y descubre.",
      icon: LayoutGrid,
      href: "/catalog",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/50"
    },
    {
      title: "TimeLine",
      desc: "Visualiza la evolución de las series a través de los años.",
      icon: Clock,
      href: "/timeline",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "hover:border-orange-500/50"
    },
    {
      title: "Calendario",
      desc: "No te pierdas ningún lanzamiento del mes.",
      icon: Calendar,
      href: "/calendar",
      color: "text-primary",
      bg: "bg-primary/10",
      border: "hover:border-primary/50"
    }
  ]

  return (
    <div className="space-y-8 md:space-y-10 pb-8">
      
      {/* 1. Navigation Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4"
      >
        {navCards.map((card, index) => (
          <Link href={card.href} key={card.title} className={`block group ${index === 0 ? 'col-span-2 md:col-span-1' : ''}`}>
            <div className={`h-full bg-uiBase/40 backdrop-blur-md border border-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 transition-all duration-300 ${card.border} hover:bg-white/5 hover:shadow-lg`}>
              <div className="flex items-center">
                <div className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl ${card.bg} ${card.color} shrink-0`}>
                  <card.icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <h3 className="flex-1 ml-2 md:ml-3 text-base md:text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                  {card.title}
                </h3>
                <ArrowRight className="text-gray-600 group-hover:text-white transition-colors transform group-hover:translate-x-1 shrink-0" size={16} />
              </div>
              <p className="hidden md:block text-sm text-gray-400 leading-relaxed mt-2">
                {card.desc}
              </p>
            </div>
          </Link>
        ))}
      </motion.section>

      {/* 2. Dynamic Sections */}
      {sections.map((section) => {
        // Skip empty sections
        if (!section.data || section.data.length === 0) return null

        return (
            <motion.section
                key={section.id}
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <div className="flex justify-between items-baseline mb-4 md:mb-6">
                    <h2 className="font-title text-xl md:text-3xl font-bold text-textWhite">
                        {section.title}
                    </h2>
                    
                    {/* "View All" Arrow Logic */}
                    {section.viewAllUrl && (
                        <Link 
                            href={section.viewAllUrl} 
                            className="font-body text-xs md:text-sm text-accent hover:text-primary transition-colors flex items-center gap-1"
                        >
                            Ver todo <ArrowRight size={14} />
                        </Link>
                    )}
                </div>

                <motion.div 
                    className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 custom-scrollbar"
                    variants={figureContainerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {section.data.map((figure) => (
                        <div key={figure.id} className="flex-shrink-0 w-48">
                            {/* @ts-expect-error - types compatibility */}
                            <FigureCard figure={figure} animationVariants={itemVariants} />
                        </div>
                    ))}

                    {/* "See More" Card if we have 15 items (implying there might be more) */}
                    {section.data.length >= 15 && section.viewAllUrl && (
                         <motion.div variants={itemVariants} className="flex-shrink-0 w-48 h-full">
                            <Link 
                                href={section.viewAllUrl}
                                className="h-full min-h-[250px] flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all group"
                            >
                                <div className="p-4 rounded-full bg-white/5 group-hover:bg-primary group-hover:text-white transition-colors mb-4">
                                    <ArrowRight size={24} />
                                </div>
                                <span className="text-sm font-bold text-white">Ver más</span>
                            </Link>
                         </motion.div>
                    )}
                </motion.div>
            </motion.section>
        )
      })}

      {sections.every(s => !s.data || s.data.length === 0) && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative py-20 px-4 flex flex-col items-center text-center"
        >
          {/* Decorative Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-64 h-64 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 bg-white/5 border border-white/10 p-8 md:p-12 rounded-3xl backdrop-blur-md max-w-2xl shadow-2xl">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 mb-6 shadow-inner">
              <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-primary" />
            </div>
            
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4 font-title tracking-tight">
              ¡Bienvenido a FiguraCollect!
            </h2>
            
            <p className="text-gray-400 text-lg leading-relaxed mb-8 font-body">
              Parece que el catálogo aún se está organizando. No te preocupes, puedes empezar a explorar usando las herramientas de arriba o volver pronto para ver las novedades destacadas.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-500">
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/5">
                ✨ Colección en crecimiento
              </span>
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/5">
                🚀 Próximos lanzamientos
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}