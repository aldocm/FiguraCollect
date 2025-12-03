import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // YYYY-MM format

    // Get all preorders for the user
    const where: Record<string, unknown> = {
      userId: session.userId,
      status: 'PREORDER'
    }

    if (month) {
      where.preorderMonth = month
    }

    const preorders = await prisma.userFigure.findMany({
      where,
      include: {
        figure: {
          include: {
            brand: true,
            line: true,
            images: { take: 1, orderBy: { order: 'asc' } }
          }
        }
      },
      orderBy: { preorderMonth: 'asc' }
    })

    // Group by month
    const byMonth: Record<string, typeof preorders> = {}
    let totalValue = 0

    for (const item of preorders) {
      const m = item.preorderMonth || item.figure.releaseDate || 'TBA'
      if (!byMonth[m]) {
        byMonth[m] = []
      }
      byMonth[m].push(item)

      // Sum prices
      if (item.userPrice) {
        totalValue += item.userPrice
      } else if (item.figure.priceMXN) {
        totalValue += item.figure.priceMXN
      }
    }

    // Calculate monthly totals
    const monthlyTotals: Record<string, number> = {}
    for (const [m, items] of Object.entries(byMonth)) {
      monthlyTotals[m] = items.reduce((sum, item) => {
        return sum + (item.userPrice || item.figure.priceMXN || 0)
      }, 0)
    }

    return NextResponse.json({
      preorders,
      byMonth,
      monthlyTotals,
      totalValue,
      totalCount: preorders.length
    })
  } catch (error) {
    console.error('Error obteniendo calendario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
