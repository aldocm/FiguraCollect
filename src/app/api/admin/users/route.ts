import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isSuperAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session || !isSuperAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        country: true,
        role: true,
        isPro: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            userFigures: true,
            lists: true,
            reviews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
