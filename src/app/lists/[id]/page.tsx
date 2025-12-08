import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser, isAdmin, isSuperAdmin } from '@/lib/auth'
import ListDetailClient from './ListDetailClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const list = await prisma.list.findUnique({
    where: { id },
    select: { name: true }
  })

  if (!list) {
    return { title: 'Lista no encontrada | FiguraCollect' }
  }

  return {
    title: `${list.name} | Listas FiguraCollect`,
    description: `Ver la lista ${list.name} en FiguraCollect.`
  }
}

export default async function ListDetailPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentUser()

  const list = await prisma.list.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, username: true } },
      items: {
        include: {
          figure: {
            include: {
              brand: true,
              line: true,
              images: { take: 1, orderBy: { order: 'asc' } }
            }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!list) {
    notFound()
  }

  // Serialize dates for client component
  const serializedList = {
    ...list,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
    items: list.items.map(item => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      figure: {
        ...item.figure,
        createdAt: item.figure.createdAt.toISOString(),
        updatedAt: item.figure.updatedAt.toISOString()
      }
    }))
  }

  const canEdit = user && (
    list.createdById === user.id ||
    isAdmin(user.role)
  )

  const canSetFeatured = user && isSuperAdmin(user.role)

  return (
    <ListDetailClient
      list={serializedList}
      canEdit={!!canEdit}
      canSetFeatured={!!canSetFeatured}
    />
  )
}
