import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isSuperAdmin } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || !isSuperAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { role, isPro, username, name, country, email } = body

    // Build update data
    const updateData: Record<string, unknown> = {}

    // Handle role update
    if (role !== undefined) {
      if (!['USER', 'ADMIN', 'SUPERADMIN'].includes(role)) {
        return NextResponse.json(
          { error: 'Role inválido' },
          { status: 400 }
        )
      }
      // Can't change own role
      if (id === session.userId) {
        return NextResponse.json(
          { error: 'No puedes cambiar tu propio rol' },
          { status: 400 }
        )
      }
      updateData.role = role
    }

    // Handle isPro toggle
    if (isPro !== undefined) {
      updateData.isPro = isPro
    }

    // Handle other fields
    if (username !== undefined) updateData.username = username
    if (name !== undefined) updateData.name = name
    if (country !== undefined) updateData.country = country
    if (email !== undefined) updateData.email = email

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isPro: true
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || !isSuperAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Can't delete self
    if (id === session.userId) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Usuario eliminado' })
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
