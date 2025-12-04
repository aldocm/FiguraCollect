import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import ListsPageClient from './ListsPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Listas | FiguraCollect',
  description: 'Descubre y crea listas de figuras personalizadas.'
}

export const dynamic = 'force-dynamic'

export default async function ListsPage() {
  const user = await getCurrentUser()

  const listInclude = {
    createdBy: { select: { username: true } },
    items: {
      include: { figure: { include: { images: { take: 1 } } } },
      take: 4
    },
    _count: { select: { items: true } }
  }

  const [featuredLists, officialLists, userLists, myLists] = await Promise.all([
    prisma.list.findMany({
      where: { isFeatured: true },
      include: listInclude,
      take: 6
    }),
    prisma.list.findMany({
      where: { isOfficial: true, isFeatured: false },
      include: listInclude,
      take: 10
    }),
    prisma.list.findMany({
      where: { isOfficial: false, isFeatured: false }, // Exclude featured to avoid dupes if any
      include: listInclude,
      orderBy: { createdAt: 'desc' },
      take: 20
    }),
    user ? prisma.list.findMany({
      where: { createdById: user.id },
      include: {
        ...listInclude,
        createdBy: false // Don't need creator for my lists, it's me
      },
      orderBy: { createdAt: 'desc' }
    }) : Promise.resolve([])
  ])

  return (
    <ListsPageClient
      user={user}
      featuredLists={featuredLists}
      officialLists={officialLists}
      userLists={userLists}
      myLists={myLists}
    />
  )
}
