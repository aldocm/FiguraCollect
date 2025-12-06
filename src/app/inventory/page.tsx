import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import InventoryClient from './InventoryClient'
import type { Metadata } from 'next'
import { Boxes, LogIn, UserPlus, ShieldCheck, Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mi Inventario | FiguraCollect',
  description: 'Gestiona tu colección personal de figuras.'
}

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const user = await getCurrentUser()

  // --------------------------------------------------------------------------
  // GUEST VIEW
  // --------------------------------------------------------------------------
  if (!user) {
    return (
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center text-center px-4 py-20">
        
        {/* Background Decor */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] opacity-50 animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] opacity-50" />
        </div>

        {/* Content Container */}
        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-sm mb-4">
            <Boxes size={48} className="text-primary" />
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight font-title">
            Organiza tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Colección</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Lleva el control total de tus figuras. Registra tus compras, gestiona tus pre-ordenes, 
            y mantén tu wishlist actualizada en un solo lugar.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-4xl mx-auto my-12">
             {[
               { icon: Search, title: "Búsqueda Instantánea", desc: "Encuentra cualquier figura de tu colección en segundos." },
               { icon: ShieldCheck, title: "Privacidad Total", desc: "Tu colección es visible solo para ti (a menos que decidas compartirla)." },
               { icon: Boxes, title: "Estados de Colección", desc: "Marca figuras como 'Tengo', 'Pre-ordenada' o 'Deseada'." }
             ].map((item, i) => (
               <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                 <item.icon className="w-8 h-8 text-blue-400 mb-3" />
                 <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                 <p className="text-sm text-gray-400">{item.desc}</p>
               </div>
             ))}
          </div>

          {/* CTA Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-105 transition-all duration-200"
            >
              <LogIn className="mr-2" size={20} />
              Iniciar Sesión
            </Link>
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-uiBase/50 border border-white/10 text-white font-bold text-lg backdrop-blur-sm hover:bg-white/10 hover:scale-105 transition-all duration-200"
            >
              <UserPlus className="mr-2" size={20} />
              Crear Cuenta
            </Link>
          </div>

        </div>
      </div>
    )
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED VIEW (Normal Flow)
  // --------------------------------------------------------------------------

  // Fetch all items for the user to enable client-side filtering/animations
  const inventory = await prisma.userFigure.findMany({
    where: { userId: user.id },
    include: {
      figure: {
        include: {
          brand: true,
          line: true,
          images: { take: 1, orderBy: { order: 'asc' } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <InventoryClient 
      items={inventory} 
      user={{ name: user.name }} 
    />
  )
}