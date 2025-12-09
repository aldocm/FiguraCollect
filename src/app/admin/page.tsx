import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import AdminDashboardClient from './AdminDashboardClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard | FiguraCollect'
}

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || !isAdmin(user.role)) {
    redirect('/')
  }

  const [brandCount, lineCount, seriesCount, figureCount, userCount, tagCount, characterCount, pendingCount] = await Promise.all([
    prisma.brand.count(),
    prisma.line.count(),
    prisma.series.count(),
    prisma.figure.count(),
    prisma.user.count(),
    prisma.tag.count(),
    prisma.character.count(),
    // Contar todo el contenido pendiente
    Promise.all([
      prisma.figure.count({ where: { status: 'PENDING' } }),
      prisma.brand.count({ where: { status: 'PENDING' } }),
      prisma.line.count({ where: { status: 'PENDING' } }),
      prisma.series.count({ where: { status: 'PENDING' } }),
      prisma.character.count({ where: { status: 'PENDING' } })
    ]).then(counts => counts.reduce((a, b) => a + b, 0))
  ])

  const stats = {
    brands: brandCount,
    lines: lineCount,
    series: seriesCount,
    figures: figureCount,
    users: userCount,
    tags: tagCount,
    characters: characterCount,
    pending: pendingCount
  }

  return (
    <AdminDashboardClient 
      user={{ name: user.name, role: user.role }} 
      stats={stats} 
    />
  )
}
