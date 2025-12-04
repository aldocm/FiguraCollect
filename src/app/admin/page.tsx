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

  const [brandCount, lineCount, seriesCount, figureCount, userCount, tagCount] = await Promise.all([
    prisma.brand.count(),
    prisma.line.count(),
    prisma.series.count(),
    prisma.figure.count(),
    prisma.user.count(),
    prisma.tag.count()
  ])

  const stats = {
    brands: brandCount,
    lines: lineCount,
    series: seriesCount,
    figures: figureCount,
    users: userCount,
    tags: tagCount
  }

  return (
    <AdminDashboardClient 
      user={{ name: user.name, role: user.role }} 
      stats={stats} 
    />
  )
}
