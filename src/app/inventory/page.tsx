import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { InventoryItemActions } from '@/components/InventoryItemActions'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  const params = await searchParams

  if (!user) {
    redirect('/login')
  }

  const statusFilter = params.status

  const where: Record<string, unknown> = { userId: user.id }
  if (statusFilter && ['WISHLIST', 'PREORDER', 'OWNED'].includes(statusFilter)) {
    where.status = statusFilter
  }

  const [inventory, counts] = await Promise.all([
    prisma.userFigure.findMany({
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
      orderBy: { createdAt: 'desc' }
    }),
    prisma.userFigure.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: true
    })
  ])

  const countMap: Record<string, number> = {}
  counts.forEach(c => { countMap[c.status] = c._count })

  const totalValue = inventory.reduce((sum, item) => {
    return sum + (item.userPrice || item.figure.priceMXN || 0)
  }, 0)

  const tabs = [
    { key: null, label: 'Todos', count: inventory.length },
    { key: 'OWNED', label: 'Owned', count: countMap['OWNED'] || 0 },
    { key: 'PREORDER', label: 'Preorder', count: countMap['PREORDER'] || 0 },
    { key: 'WISHLIST', label: 'Wishlist', count: countMap['WISHLIST'] || 0 }
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Mi Inventario</h1>
      <p className="text-gray-600 mb-6">
        {inventory.length} figuras · Valor total: ${totalValue.toLocaleString()} MXN
      </p>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        {tabs.map(tab => (
          <Link
            key={tab.key || 'all'}
            href={tab.key ? `/inventory?status=${tab.key}` : '/inventory'}
            className={`pb-2 px-1 text-sm ${
              (statusFilter || null) === tab.key
                ? 'border-b-2 border-black font-medium'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            {tab.label} ({tab.count})
          </Link>
        ))}
      </div>

      {inventory.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>No tienes figuras en esta categoría.</p>
          <Link href="/catalog" className="text-black hover:underline">
            Explorar catálogo →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {inventory.map(item => (
            <div key={item.id} className="border rounded-lg p-4 flex gap-4">
              <Link href={`/catalog/${item.figureId}`} className="w-24 h-24 flex-shrink-0">
                <div className="w-full h-full bg-gray-100 rounded">
                  {item.figure.images[0] && (
                    <img
                      src={item.figure.images[0].url}
                      alt={item.figure.name}
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                </div>
              </Link>

              <div className="flex-1">
                <Link href={`/catalog/${item.figureId}`} className="hover:underline">
                  <p className="font-medium">{item.figure.name}</p>
                </Link>
                <p className="text-sm text-gray-500">
                  {item.figure.brand.name} · {item.figure.line.name}
                </p>

                <div className="flex items-center gap-4 mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.status === 'OWNED' ? 'bg-green-100 text-green-700' :
                    item.status === 'PREORDER' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.status}
                  </span>

                  {item.userPrice ? (
                    <span className="text-sm">${item.userPrice} MXN</span>
                  ) : item.figure.priceMXN && (
                    <span className="text-sm text-gray-500">${item.figure.priceMXN} MXN</span>
                  )}

                  {item.status === 'PREORDER' && item.preorderMonth && (
                    <span className="text-sm text-blue-600">
                      Llegada: {item.preorderMonth}
                    </span>
                  )}
                </div>
              </div>

              <InventoryItemActions item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
