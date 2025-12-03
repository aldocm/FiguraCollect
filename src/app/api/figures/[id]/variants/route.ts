import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || !isAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name, priceMXN, priceUSD, priceYEN, images } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre requerido' },
        { status: 400 }
      )
    }

    const figure = await prisma.figure.findUnique({
      where: { id }
    })

    if (!figure) {
      return NextResponse.json(
        { error: 'Figura no encontrada' },
        { status: 404 }
      )
    }

    const variant = await prisma.figureVariant.create({
      data: {
        name,
        priceMXN: priceMXN || null,
        priceUSD: priceUSD || null,
        priceYEN: priceYEN || null,
        parentFigureId: id,
        images: images?.length ? {
          create: images.map((url: string, index: number) => ({
            url,
            order: index
          }))
        } : undefined
      },
      include: { images: true }
    })

    return NextResponse.json({ variant }, { status: 201 })
  } catch (error) {
    console.error('Error creando variant:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
