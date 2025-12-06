import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'SUPERADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { items } = body // Expect array of { id, order }

    if (!Array.isArray(items)) {
      return new NextResponse('Invalid data', { status: 400 })
    }

    // Transaction to update all orders
    await prisma.$transaction(
      items.map((item: { id: string, order: number }) => 
        prisma.homeSection.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      )
    )

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('[HOME_SECTIONS_REORDER]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
