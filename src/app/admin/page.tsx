import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCurrentUser, isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || !isAdmin(user.role)) {
    redirect('/')
  }

  const [brandCount, lineCount, seriesCount, figureCount, userCount, tagCount] = await Promise.all([
    prisma.brand.count(),
    prisma.line.count(),
    prisma.series.count(),
    prisma.figure.count(),
    prisma.user.count(),
    prisma.tag.count()
  ])

  const adminSections = [
    { href: '/admin/brands', label: 'Marcas', count: brandCount },
    { href: '/admin/lines', label: 'Líneas', count: lineCount },
    { href: '/admin/series', label: 'Series', count: seriesCount },
    { href: '/admin/tags', label: 'Tags', count: tagCount },
    { href: '/admin/figures', label: 'Figuras', count: figureCount }
  ]

  const superAdminSections = [
    { href: '/admin/users', label: 'Usuarios', count: userCount }
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {adminSections.map(section => (
          <Link
            key={section.href}
            href={section.href}
            className="border rounded-lg p-6 hover:border-black transition-colors"
          >
            <p className="text-3xl font-bold">{section.count}</p>
            <p className="text-gray-600">{section.label}</p>
          </Link>
        ))}

        {user.role === 'SUPERADMIN' && superAdminSections.map(section => (
          <Link
            key={section.href}
            href={section.href}
            className="border rounded-lg p-6 hover:border-black transition-colors bg-purple-50"
          >
            <p className="text-3xl font-bold">{section.count}</p>
            <p className="text-gray-600">{section.label}</p>
            <span className="text-xs text-purple-600">Solo SuperAdmin</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
