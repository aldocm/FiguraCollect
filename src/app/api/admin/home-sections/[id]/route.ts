import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'SUPERADMIN') return new NextResponse('Unauthorized', { status: 401 })

    const body = await req.json()
    const { title, config, viewAllUrl, isVisible } = body

    const section = await prisma.homeSection.update({
      where: { id: params.id },
      data: {
        title,
        config: typeof config === 'object' ? JSON.stringify(config) : config,
        viewAllUrl,
        isVisible
      }
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('[HOME_SECTION_PUT]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'SUPERADMIN') return new NextResponse('Unauthorized', { status: 401 })

    await prisma.homeSection.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[HOME_SECTION_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
