'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User as UserIcon, Menu, X, LogOut, ShoppingBag, Calendar, Shield } from 'lucide-react'

interface User {
  id: string
  username: string
  role: string
}

export function Nav() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data?.user || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'

  const navLinks = [
    { name: 'Catálogo', href: '/catalog' },
    { name: 'Calendario', href: '/calendar' },
    { name: 'Listas', href: '/lists' },
    { name: 'Timeline', href: '/timeline' },
  ]

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 20 }
    }
  }

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen 
          ? 'bg-background/80 backdrop-blur-lg border-b border-white/5 shadow-lg py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl transform group-hover:rotate-12 transition-transform duration-300">
              F
            </div>
            <span className="font-title text-2xl font-bold text-white tracking-tight">
              Figura<span className="text-primary">Collect</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors text-white/80 hover:text-white"
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/10 rounded-full -z-10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-4">
                {/* Quick Actions */}
                <Link href="/inventory" className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Mi Inventario">
                  <ShoppingBag size={20} />
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors" title="Admin Panel">
                    <Shield size={20} />
                  </Link>
                )}
                
                {/* User Menu / Logout */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                  <span className="text-sm font-medium text-white">{user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-xs font-bold transition-all border border-white/5 hover:border-red-500/30"
                  >
                    <LogOut size={14} />
                    Salir
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-bold bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 hover:shadow-[0_0_15px_-3px_rgba(225,6,44,0.4)] transition-all transform hover:-translate-y-0.5"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-lg font-medium ${
                    pathname === link.href ? 'text-primary' : 'text-white/80'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="h-px bg-white/10 my-4" />
              
              {user ? (
                <div className="space-y-4">
                  <Link href="/inventory" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-white/80">
                    <ShoppingBag size={20} /> Mi Inventario
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-white/80">
                      <Shield size={20} /> Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 w-full pt-2">
                    <LogOut size={20} /> Cerrar Sesión ({user.username})
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2 rounded-lg bg-white/5 text-white font-medium">
                    Iniciar sesión
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="text-center py-2 rounded-lg bg-primary text-white font-bold">
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}