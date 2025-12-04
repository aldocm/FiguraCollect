'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { LayoutGrid, Calendar, Clock, ArrowRight } from 'lucide-react'
import FigureCard from '@/components/FigureCard'
import FeaturedListCard from '@/components/FeaturedListCard'

// Define types for the data props based on the prisma queries in page.tsx
type Figure = {
  id: string
  name: string
  releaseDate: string | null
  priceMXN?: number | null
  isReleased: boolean
  brand: { name: string }
  line?: { name: string }
  images: { url: string }[]
}

type List = {
  id: string
  name: string
  createdBy: { username: string }
  items: {
    id: string
    figure: {
      images: { url: string }[]
    }
  }[]
  _count: { items: number }
}

interface HomePageClientProps {
  featuredLists: List[]
  upcomingFigures: Figure[]
  recentFigures: Figure[]
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

export default function HomePageClient({
  featuredLists,
  upcomingFigures,
  recentFigures,
}: HomePageClientProps) {
  // Define animation variants for staggered items within sections
  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger lists
      },
    },
  };

  const figureContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07, // Stagger figures
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

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
    <div className="space-y-8 md:space-y-10 pb-20">
      
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

      {/* 2. Recently Added Section */}
      {recentFigures.length > 0 && (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="flex justify-between items-baseline mb-4 md:mb-6">
            <h2 className="font-title text-xl md:text-3xl font-bold text-textWhite">Agregadas Recientemente</h2>
            <Link href="/catalog" className="font-body text-xs md:text-sm text-accent hover:text-primary transition-colors">
              Ver catálogo →
            </Link>
          </div>
          <motion.div 
            className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 custom-scrollbar"
            variants={figureContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {recentFigures.map(figure => (
              <div key={figure.id} className="flex-shrink-0 w-48">
            {/* @ts-expect-error - types are slightly different but compatible for display */}
                <FigureCard figure={figure} animationVariants={itemVariants} />
              </div>
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* 3. Upcoming Releases Section */}
      {upcomingFigures.length > 0 && (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="flex justify-between items-baseline mb-4 md:mb-6">
            <h2 className="font-title text-xl md:text-3xl font-bold text-textWhite">Próximos Lanzamientos</h2>
            <Link href="/catalog?isReleased=false" className="font-body text-xs md:text-sm text-accent hover:text-primary transition-colors">
              Ver todos →
            </Link>
          </div>
          <motion.div 
            className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 custom-scrollbar"
            variants={figureContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {upcomingFigures.map(figure => (
              <div key={figure.id} className="flex-shrink-0 w-48">
            {/* @ts-expect-error - types are slightly different but compatible for display */}
                <FigureCard figure={figure} animationVariants={itemVariants} />
              </div>
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* 4. Featured Lists Section */}
      {featuredLists.length > 0 && (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="font-title text-xl md:text-3xl font-bold text-textWhite mb-4 md:mb-6">Listas Destacadas</h2>
          <motion.div 
            className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 custom-scrollbar"
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {featuredLists.map(list => (
              // @ts-expect-error - types are slightly different but compatible for display
              <FeaturedListCard key={list.id} list={list} animationVariants={itemVariants} />
            ))}
          </motion.div>
        </motion.section>
      )}

      {recentFigures.length === 0 && featuredLists.length === 0 && upcomingFigures.length === 0 && (
        <div className="text-center py-20 text-textWhite/50 font-body">
          <p>No hay figuras en el catálogo aún.</p>
          <p className="text-sm mt-2">
            Un administrador debe agregar figuras desde el panel de admin.
          </p>
        </div>
      )}
    </div>
  )
}