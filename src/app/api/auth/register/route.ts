import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, generateVerifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password, name, country, bio } = body

    if (!email || !username || !password || !country) {
      return NextResponse.json(
        { error: 'Email, username, password y country son requeridos' },
        { status: 400 }
      )
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'El username ya está en uso' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const verifyToken = generateVerifyToken()

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name: name || null,
        country,
        bio: bio || null,
        verifyToken,
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        country: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user,
      verifyToken
    }, { status: 201 })

  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
