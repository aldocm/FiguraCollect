import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: { verifyToken: token }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verifyToken: null
      }
    })

    return NextResponse.json({
      message: 'Email verificado exitosamente'
    })

  } catch (error) {
    console.error('Error verificando email:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
