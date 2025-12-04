'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User as UserIcon, Menu, X, LogOut, ShoppingBag, Shield, Bell, Check, Package, Search, ChevronDown, Box, Tag, Layers, ArrowRight } from 'lucide-react'

interface User {
  id: string
  username: string
  role: string
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  link: string | null
  createdAt: string
  figure?: {
    id: string
    name: string
    images: { url: string }[]
  } | null
}

interface SearchResult {
  id: string
  name: string
  type: 'figure' | 'brand' | 'line' | 'series'
  image?: string
  subtitle?: string
}

export function Nav() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0)
  const notificationRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Fetch user
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

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (user) {
      fetchNotifications()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
        setShowSearchResults(true)
      }
      // Handle search navigation
      if (showSearchResults && searchResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedSearchIndex(i => Math.min(i + 1, searchResults.length - 1))
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedSearchIndex(i => Math.max(i - 1, 0))
        }
        if (e.key === 'Enter') {
          e.preventDefault()
          handleSearchSelect(searchResults[selectedSearchIndex])
        }
      }
      if (e.key === 'Escape') {
        setShowSearchResults(false)
        searchInputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSearchResults, searchResults, selectedSearchIndex])

  // Search debounce effect
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=6`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.results)
          setSelectedSearchIndex(0)
          setShowSearchResults(true)
        }
      } catch (e) {
        console.error('Search error', e)
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearchSelect = (result: SearchResult) => {
    let path = ''
    switch (result.type) {
      case 'figure':
        path = `/catalog/${result.id}`
        break
      case 'brand':
        path = `/catalog?brandId=${result.id}`
        break
      case 'line':
        path = `/catalog?lineId=${result.id}`
        break
      case 'series':
        path = `/catalog?seriesId=${result.id}`
        break
    }
    router.push(path)
    setShowSearchResults(false)
    setSearchQuery('')
  }

  const getSearchIcon = (type: string) => {
    switch (type) {
      case 'figure': return Package
      case 'brand': return Box
      case 'line': return Layers
      case 'series': return Tag
      default: return Package
    }
  }

  const getSearchTypeLabel = (type: string) => {
    switch (type) {
      case 'figure': return 'Figura'
      case 'brand': return 'Marca'
      case 'line': return 'Línea'
      case 'series': return 'Serie'
      default: return type
    }
  }

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=10')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (e) {
      console.error('Error fetching notifications', e)
    }
  }

  const markAsRead = async (notificationIds?: string[]) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationIds ? { notificationIds } : { markAllRead: true })
      })
      fetchNotifications()
    } catch (e) {
      console.error('Error marking notifications as read', e)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead([notification.id])
    }
    if (notification.link) {
      router.push(notification.link)
      setShowNotifications(false)
    }
  }

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
          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : (
              <>
                {/* Global Search */}
                <div className="relative" ref={searchRef}>
                  <div className="flex items-center bg-white/5 hover:bg-white/10 focus-within:bg-white/10 rounded-full px-4 py-2 border border-white/5 focus-within:border-white/20 transition-all w-64 group">
                    <Search size={16} className="text-gray-400 group-focus-within:text-white transition-colors mr-2" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                      placeholder="Buscar..."
                      className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-full"
                    />
                    <div className="hidden group-focus-within:flex gap-1">
                      <kbd className="hidden sm:inline-block px-1.5 h-5 text-[10px] leading-5 font-sans font-medium text-gray-500 bg-white/5 rounded border border-white/10">
                        ESC
                      </kbd>
                    </div>
                  </div>

                  {/* Search Results Dropdown */}
                  <AnimatePresence>
                    {showSearchResults && searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-96 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="max-h-[400px] overflow-y-auto py-2">
                          {searchResults.map((result, index) => {
                            const Icon = getSearchIcon(result.type)
                            return (
                              <button
                                key={`${result.type}-${result.id}`}
                                onClick={() => handleSearchSelect(result)}
                                onMouseEnter={() => setSelectedSearchIndex(index)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                  index === selectedSearchIndex ? 'bg-white/10' : 'hover:bg-white/5'
                                }`}
                              >
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                  {result.image ? (
                                    <img src={result.image} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Icon size={18} className="text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-grow min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{result.name}</p>
                                  <p className="text-xs text-gray-500 flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] uppercase font-bold">
                                      {getSearchTypeLabel(result.type)}
                                    </span>
                                    {result.subtitle && <span className="truncate">{result.subtitle}</span>}
                                  </p>
                                </div>
                                {index === selectedSearchIndex && (
                                  <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {user ? (
                  <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                      <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
                        title="Notificaciones"
                      >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>

                      {/* Notifications Dropdown */}
                      <AnimatePresence>
                        {showNotifications && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-80 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                          >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                              <h3 className="font-bold text-white text-sm">Notificaciones</h3>
                              {unreadCount > 0 && (
                                <button
                                  onClick={() => markAsRead()}
                                  className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                                >
                                  <Check size={12} />
                                  Marcar todas
                                </button>
                              )}
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-80 overflow-y-auto">
                              {notifications.length === 0 ? (
                                <div className="py-8 text-center">
                                  <Bell size={32} className="mx-auto text-gray-600 mb-2" />
                                  <p className="text-gray-500 text-sm">Sin notificaciones</p>
                                </div>
                              ) : (
                                notifications.map(notification => (
                                  <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${
                                      !notification.isRead ? 'bg-primary/5' : ''
                                    }`}
                                  >
                                    {/* Icon or Figure Image */}
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                      {notification.figure?.images[0] ? (
                                        <img
                                          src={notification.figure.images[0].url}
                                          alt=""
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <Package size={18} className="text-primary" />
                                      )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow min-w-0">
                                      <p className="text-sm font-medium text-white truncate">
                                        {notification.title}
                                      </p>
                                      <p className="text-xs text-gray-400 truncate">
                                        {notification.message}
                                      </p>
                                      <p className="text-[10px] text-gray-500 mt-1">
                                        {new Date(notification.createdAt).toLocaleDateString('es-MX', {
                                          day: 'numeric',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>

                                    {/* Unread indicator */}
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                                    )}
                                  </button>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 pl-4 border-l border-white/10 group"
                      >
                        <div className="text-right hidden lg:block">
                          <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{user.username}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{user.role === 'ADMIN' || user.role === 'SUPERADMIN' ? 'Admin' : 'Usuario'}</p>
                        </div>
                                              <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold group-hover:border-primary group-hover:text-primary transition-all">
                                                {user.username[0].toUpperCase()}
                                              </div>
                                              <ChevronDown size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                                            </button>
                      {/* User Dropdown */}
                      <AnimatePresence>
                        {showUserMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                          >
                            <div className="p-2">
                              <Link 
                                href="/inventory" 
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-gray-300 hover:text-white transition-colors"
                              >
                                <ShoppingBag size={16} />
                                Mi Inventario
                              </Link>
                              
                              {isAdmin && (
                                <Link 
                                  href="/admin" 
                                  onClick={() => setShowUserMenu(false)}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                  <Shield size={16} />
                                  Admin Panel
                                </Link>
                              )}

                              <div className="h-px bg-white/5 my-2" />
                              
                              <button
                                onClick={() => {
                                  setShowUserMenu(false)
                                  handleLogout()
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-sm text-red-400 hover:text-red-300 transition-colors"
                              >
                                <LogOut size={16} />
                                Cerrar Sesión
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/login"
                      className="text-sm font-bold bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 hover:shadow-[0_0_15px_-3px_rgba(225,6,44,0.4)] transition-all transform hover:-translate-y-0.5"
                    >
                      Iniciar Sesión
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
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