'use client'

import Link from 'next/link'
import { Github, Twitter, Instagram, Youtube, Heart, Coffee } from 'lucide-react'

export function Footer() {
  
  const footerLinks = {
    product: [
      { name: 'Catálogo', href: '/catalog' },
      { name: 'Listas', href: '/lists' },
      { name: 'Calendario', href: '/calendar' },
      { name: 'Novedades', href: '/news' },
    ],
    company: [
      { name: 'Nosotros', href: '/about' },
      { name: 'Términos', href: '/terms' },
      { name: 'Privacidad', href: '/privacy' },
      { name: 'Cookies', href: '/cookies' },
    ],
    social: [
      { name: 'Instagram', icon: Instagram, href: '#' },
      { name: 'Twitter', icon: Twitter, href: '#' },
      { name: 'GitHub', icon: Github, href: '#' },
      { name: 'YouTube', icon: Youtube, href: '#' },
    ]
  }

  return (
    <footer className="bg-background border-t border-white/5 mt-auto relative overflow-hidden">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">F</div>
              <span className="font-title text-2xl font-bold text-white tracking-tight">
                Figura<span className="text-primary">Collect</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              La plataforma definitiva para coleccionistas. Gestiona, descubre y comparte tu pasión por las figuras con una comunidad global.
            </p>
            <div className="flex gap-4 pt-2">
              {footerLinks.social.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href}
                  className="text-gray-400 hover:text-primary transition-colors p-2 hover:bg-white/5 rounded-full"
                >
                  <item.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-white font-bold mb-4 font-title">Explorar</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-white font-bold mb-4 font-title">Soporte</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-white font-bold mb-4 font-title flex items-center gap-2">
              <Heart size={18} className="text-primary" />
              Apoya el proyecto
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Ayuda a que FiguraCollect siga creciendo. Tu apoyo nos permite seguir mejorando la plataforma para toda la comunidad.
            </p>
            <a
              href="https://ko-fi.com/aldocm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#FF5E5B] hover:bg-[#FF5E5B]/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#FF5E5B]/20"
            >
              <Coffee size={18} />
              Invítame un café
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} FiguraCollect. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacidad</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}