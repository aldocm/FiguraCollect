'use client'

import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import {
  Users, Layers, Tags, Box, Library, BadgeCheck,
  ArrowRight, ShieldAlert, User, LayoutTemplate, Settings2
} from 'lucide-react'

interface AdminDashboardClientProps {
  user: {
    name: string | null
    role: string
  }
  stats: {
    brands: number
    lines: number
    series: number
    figures: number
    users: number
    tags: number
    characters: number
  }
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
}

export default function AdminDashboardClient({ user, stats }: AdminDashboardClientProps) {
  const adminCards = [
    { 
      href: '/admin/home', 
      label: 'Home Layout', 
      count: -1, 
      icon: LayoutTemplate, 
      color: 'text-pink-400',
      bg: 'from-pink-500/20 to-rose-500/5',
      desc: 'Personalizar página de inicio',
      isSuper: true
    },
    { 
      href: '/admin/brands', 
      label: 'Marcas', 
      count: stats.brands, 
      icon: BadgeCheck, 
      color: 'text-yellow-400',
      bg: 'from-yellow-500/20 to-orange-500/5',
      desc: 'Gestionar fabricantes y marcas'
    },
    { 
      href: '/admin/lines', 
      label: 'Líneas', 
      count: stats.lines, 
      icon: Layers, 
      color: 'text-blue-400',
      bg: 'from-blue-500/20 to-cyan-500/5',
      desc: 'Colecciones y líneas de productos'
    },
    { 
      href: '/admin/series', 
      label: 'Series', 
      count: stats.series, 
      icon: Library, 
      color: 'text-purple-400',
      bg: 'from-purple-500/20 to-pink-500/5',
      desc: 'Franquicias y series de origen'
    },
    {
      href: '/admin/characters',
      label: 'Personajes',
      count: stats.characters,
      icon: User,
      color: 'text-cyan-400',
      bg: 'from-cyan-500/20 to-teal-500/5',
      desc: 'Characters de figuras'
    },
    {
      href: '/admin/figures',
      label: 'Figuras',
      count: stats.figures,
      icon: Box,
      color: 'text-primary',
      bg: 'from-primary/20 to-red-900/5',
      desc: 'Catálogo completo de figuras',
      featured: true
    },
    {
      href: '/admin/tags',
      label: 'Tags',
      count: stats.tags,
      icon: Tags,
      color: 'text-emerald-400',
      bg: 'from-emerald-500/20 to-green-500/5',
      desc: 'Etiquetas y categorías'
    }
  ]

  const superAdminCards = [
    { 
      href: '/admin/users', 
      label: 'Usuarios', 
      count: stats.users, 
      icon: Users, 
      color: 'text-indigo-400',
      bg: 'from-indigo-500/20 to-violet-500/5',
      desc: 'Gestión de usuarios y roles',
      isSuper: true
    }
  ]

  return (
    <div className="flex-1 bg-background pb-0 md:pb-20 relative overflow-hidden">
       {/* Background Elements */}
       <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent opacity-30" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
       </div>

       <div className="relative z-10 container mx-auto px-4">

          {/* Header */}
          <div className="mb-6 md:mb-8">
             <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex items-center gap-3 mb-2"
             >
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Panel de Control
                </span>
                {user.role === 'SUPERADMIN' && (
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                    <ShieldAlert size={12} /> Super Admin
                  </span>
                )}
             </motion.div>

             <motion.h1
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.1 }}
               className="text-2xl md:text-4xl font-title font-black text-white mb-1 md:mb-2"
             >
                Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{user.name?.split(' ')[0]}</span>
             </motion.h1>
             <motion.p
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="text-gray-400 text-sm max-w-2xl"
             >
                Bienvenido de nuevo. Aquí tienes un resumen de la actividad y accesos directos para gestionar la plataforma.
             </motion.p>
          </div>

          {/* Main Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
          >
              {/* Render Standard Admin Cards */}
              {adminCards.map((card) => (
                  <motion.div variants={itemVariants} key={card.href}>
                      <Link 
                        href={card.href}
                        className={`group relative block h-full p-2.5 md:p-6 rounded-xl md:rounded-3xl border border-white/5 bg-gradient-to-br ${card.bg} backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1`}
                      >
                          <div className="flex justify-between items-start mb-2 md:mb-8">
                              <div className={`p-1.5 md:p-3 rounded-lg md:rounded-2xl bg-black/20 ${card.color}`}>
                                  <card.icon className="w-4 h-4 md:w-8 md:h-8" />
                              </div>
                              <div className="px-1.5 md:px-3 py-0.5 md:py-1 rounded-full bg-black/20 border border-white/5">
                                  <span className="text-sm md:text-2xl font-black text-white">
                                    {card.count === -1 ? <Settings2 size={20} /> : card.count}
                                  </span>
                              </div>
                          </div>

                          <div>
                              <h3 className="text-sm md:text-2xl font-bold text-white group-hover:text-primary transition-colors flex items-center gap-1 md:gap-2">
                                  {card.label}
                                  <ArrowRight className="w-3 h-3 md:w-[18px] md:h-[18px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                              </h3>
                              <p className="text-xs md:text-sm text-gray-400 font-medium hidden md:block">
                                  {card.desc}
                              </p>
                          </div>

                          {/* Decor */}
                          <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full ${card.color.replace('text-', 'bg-')} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
                      </Link>
                  </motion.div>
              ))}

              {/* Render Super Admin Cards */}
              {user.role === 'SUPERADMIN' && superAdminCards.map((card) => (
                  <motion.div variants={itemVariants} key={card.href}>
                      <Link 
                        href={card.href}
                        className={`group relative block h-full p-2.5 md:p-6 rounded-xl md:rounded-3xl border border-purple-500/30 bg-gradient-to-br ${card.bg} backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-purple-500/60 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)] hover:-translate-y-1`}
                      >
                          <div className="absolute top-2 right-2 md:top-3 md:right-3">
                              <ShieldAlert className="text-purple-500 opacity-50 w-4 h-4 md:w-5 md:h-5" />
                          </div>

                          <div className="flex justify-between items-start mb-2 md:mb-8">
                              <div className={`p-1.5 md:p-3 rounded-lg md:rounded-2xl bg-black/20 ${card.color}`}>
                                  <card.icon className="w-4 h-4 md:w-8 md:h-8" />
                              </div>
                              <div className="px-1.5 md:px-3 py-0.5 md:py-1 rounded-full bg-black/20 border border-white/5">
                                  <span className="text-sm md:text-2xl font-black text-white">
                                    {card.count === -1 ? <Settings2 size={20} /> : card.count}
                                  </span>
                              </div>
                          </div>

                          <div>
                              <h3 className="text-sm md:text-2xl font-bold text-white group-hover:text-purple-400 transition-colors flex items-center gap-1 md:gap-2">
                                  {card.label}
                                  <ArrowRight className="w-3 h-3 md:w-[18px] md:h-[18px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                              </h3>
                              <p className="text-xs md:text-sm text-gray-400 font-medium hidden md:block">
                                  {card.desc}
                              </p>
                          </div>
                      </Link>
                  </motion.div>
              ))}

              {/* Activity / Quick Stats Placeholder (Visual balance) */}
              {/* <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-1 p-6 rounded-3xl border border-white/5 bg-uiBase/30 backdrop-blur-md flex flex-col justify-center items-center text-center opacity-60">
                  <div className="p-4 bg-white/5 rounded-full mb-4">
                      <Activity size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Actividad Reciente</h3>
                  <p className="text-sm text-gray-500">Próximamente: Gráficos y métricas en tiempo real.</p>
              </motion.div> */}
          </motion.div>
       </div>
    </div>
  )
}
