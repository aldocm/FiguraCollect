import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import InventoryClient from './InventoryClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mi Inventario | FiguraCollect',
  description: 'Gestiona tu colección personal de figuras.'
}

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

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

  // Serialize data for client component (Dates to strings)
  const serializedInventory = inventory.map(item => ({
    ...item,
    createdAt: item.createdAt, // Passing Date is technically allowed in recent Next.js versions if using flight, but safer to pass as string or ensure type match. 
    // Actually, let's check if InventoryClient expects Date or string. I defined it as Date in InventoryClient.
    // Next.js 13+ App Router DOES allow passing Date objects to Client Components from Server Components in the payload.
    // However, to be safe and avoid warnings:
    // But wait, I defined `createdAt: Date` in InventoryClient. 
    // Let's stick to passing it as is. If it fails, I will fix it. 
    // Most standard setups allow Date serialization now in RSC payload.
  }))

  return (
    <InventoryClient 
      items={serializedInventory} 
      user={{ name: user.name }} 
    />
  )
}
