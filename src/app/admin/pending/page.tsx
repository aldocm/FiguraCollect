import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import PendingClient from './PendingClient'

export default async function PendingPage() {
  const user = await getCurrentUser()

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
    redirect('/admin')
  }

  // Obtener conteos
  const [
    figuresCount,
    brandsCount,
    linesCount,
    seriesCount,
    charactersCount
  ] = await Promise.all([
    prisma.figure.count({ where: { status: 'PENDING' } }),
    prisma.brand.count({ where: { status: 'PENDING' } }),
    prisma.line.count({ where: { status: 'PENDING' } }),
    prisma.series.count({ where: { status: 'PENDING' } }),
    prisma.character.count({ where: { status: 'PENDING' } })
  ])

  const counts = {
    figures: figuresCount,
    brands: brandsCount,
    lines: linesCount,
    series: seriesCount,
    characters: charactersCount,
    total: figuresCount + brandsCount + linesCount + seriesCount + charactersCount
  }

  return <PendingClient initialCounts={counts} />
}
