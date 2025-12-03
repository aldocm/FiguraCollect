import { prisma } from '@/lib/db'
import HomePageClient from './HomePageClient'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [featuredLists, upcomingFigures, recentFigures] = await Promise.all([
    prisma.list.findMany({
      where: { isFeatured: true },
      include: {
        createdBy: { select: { username: true } },
        items: {
          include: {
            figure: { include: { images: { take: 1 } } }
          },
          take: 4
        },
        _count: { select: { items: true } }
      },
      take: 3
    }),
    prisma.figure.findMany({
      where: {
        isReleased: false,
        releaseDate: { not: null }
      },
      include: {
        brand: true,
        images: { take: 1 }
      },
      orderBy: { releaseDate: 'asc' },
      take: 6
    }),
    prisma.figure.findMany({
      include: {
        brand: true,
        images: { take: 1 }
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    })
  ])

  return (
    <HomePageClient
      featuredLists={featuredLists}
      upcomingFigures={upcomingFigures}
      recentFigures={recentFigures}
    />
  )
}
