import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'SUPERADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const sections = await prisma.homeSection.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(sections)
  } catch (error) {
    console.error('[HOME_SECTIONS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'SUPERADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { title, type, config, viewAllUrl } = body

    const count = await prisma.homeSection.count()

    const section = await prisma.homeSection.create({
      data: {
        title,
        type,
        config: JSON.stringify(config),
        viewAllUrl,
        order: count,
      },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('[HOME_SECTIONS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
