import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'

type ContentType = 'figure' | 'brand' | 'line' | 'series' | 'character'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { type, id, approved } = await request.json() as {
      type: ContentType
      id: string
      approved: boolean
    }

    if (!type || !id || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Parámetros inválidos. Se requiere: type, id, approved' },
        { status: 400 }
      )
    }

    const newStatus = approved ? 'APPROVED' : 'PENDING'
    let result

    switch (type) {
      case 'figure':
        result = await prisma.figure.update({
          where: { id },
          data: {
            status: newStatus,
            approvedById: approved ? session.userId : null,
            approvedAt: approved ? new Date() : null
          }
        })
        break

      case 'brand':
        result = await prisma.brand.update({
          where: { id },
          data: { status: newStatus }
        })
        break

      case 'line':
        result = await prisma.line.update({
          where: { id },
          data: { status: newStatus }
        })
        break

      case 'series':
        result = await prisma.series.update({
          where: { id },
          data: { status: newStatus }
        })
        break

      case 'character':
        result = await prisma.character.update({
          where: { id },
          data: { status: newStatus }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Tipo inválido. Tipos válidos: figure, brand, line, series, character' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: approved ? 'Contenido aprobado' : 'Contenido rechazado',
      result
    })
  } catch (error) {
    console.error('Error aprobando contenido:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE - Eliminar contenido pendiente
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as ContentType
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Se requiere type e id' },
        { status: 400 }
      )
    }

    switch (type) {
      case 'figure':
        await prisma.figure.delete({ where: { id } })
        break
      case 'brand':
        await prisma.brand.delete({ where: { id } })
        break
      case 'line':
        await prisma.line.delete({ where: { id } })
        break
      case 'series':
        await prisma.series.delete({ where: { id } })
        break
      case 'character':
        await prisma.character.delete({ where: { id } })
        break
      default:
        return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Contenido eliminado' })
  } catch (error) {
    console.error('Error eliminando contenido:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
