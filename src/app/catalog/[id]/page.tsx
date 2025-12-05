import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import FigureDetailClient from './FigureDetailClient'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const figure = await prisma.figure.findUnique({
    where: { id },
    select: { name: true, brand: { select: { name: true } } }
  })

  if (!figure) {
    return {
      title: 'Figura no encontrada | FiguraCollect'
    }
  }

  return {
    title: `${figure.name} - ${figure.brand.name} | FiguraCollect`,
    description: `Detalles y precios de ${figure.name} por ${figure.brand.name}.`
  }
}

export default async function FigureDetailPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentUser()

  const figure = await prisma.figure.findUnique({
    where: { id },
    include: {
      brand: true,
      line: true,
      character: { include: { series: true } },
      images: { orderBy: { order: 'asc' } },
      tags: { include: { tag: true } },
      series: { include: { series: true } },
      variants: { include: { images: { take: 1, orderBy: { order: 'asc' } } } },
      reviews: {
        include: {
          user: { select: { id: true, username: true } },
          images: { orderBy: { order: 'asc' } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!figure) {
    notFound()
  }

  let userFigure = null
  if (user) {
    userFigure = await prisma.userFigure.findUnique({
      where: {
        userId_figureId: {
          userId: user.id,
          figureId: id
        }
      }
    })
  }
  
  // The Prisma client returns Decimal for Float types, which are not directly serializable.
  // We can convert them to numbers before passing them to the client component.
  const serializableFigure = {
    ...figure,
    priceMXN: figure.priceMXN,
    priceUSD: figure.priceUSD,
    priceYEN: figure.priceYEN,
    reviews: figure.reviews.map(r => ({ ...r, rating: r.rating })),
    variants: figure.variants.map(v => ({...v, priceMXN: v.priceMXN, priceUSD: v.priceUSD, priceYEN: v.priceYEN}))
  }

  return (
    <FigureDetailClient
      figure={serializableFigure}
      user={user}
      userFigure={userFigure}
    />
  )
}
