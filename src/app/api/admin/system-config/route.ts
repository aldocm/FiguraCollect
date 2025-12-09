import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, isSuperAdmin } from '@/lib/auth'
import { CONFIG_KEYS } from '@/lib/config'

// GET - Obtener configuraciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key) {
      const config = await prisma.systemConfiguration.findUnique({
        where: { key }
      })

      if (!config) {
        return NextResponse.json({ config: null })
      }

      return NextResponse.json({
        config: {
          ...config,
          value: JSON.parse(config.value)
        }
      })
    }

    // Retornar todas las configuraciones
    const configs = await prisma.systemConfiguration.findMany()
    const parsedConfigs = configs.map(c => ({
      ...c,
      value: JSON.parse(c.value)
    }))

    return NextResponse.json({ configs: parsedConfigs })
  } catch (error) {
    console.error('Error obteniendo configuración:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Actualizar configuración (solo SUPERADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !isSuperAdmin(session.role)) {
      return NextResponse.json(
        { error: 'No autorizado - Solo SUPERADMIN' },
        { status: 403 }
      )
    }

    const { key, value } = await request.json()

    if (!key || !Object.values(CONFIG_KEYS).includes(key)) {
      return NextResponse.json(
        { error: 'Clave de configuración inválida' },
        { status: 400 }
      )
    }

    const config = await prisma.systemConfiguration.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) }
    })

    return NextResponse.json({
      config: {
        ...config,
        value: JSON.parse(config.value)
      }
    })
  } catch (error) {
    console.error('Error actualizando configuración:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
