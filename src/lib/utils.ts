export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatPrice(price: number | null, currency: 'MXN' | 'USD' | 'YEN'): string {
  if (price === null) return 'N/A'

  const symbols = {
    MXN: '$',
    USD: '$',
    YEN: '¥'
  }

  return `${symbols[currency]}${price.toLocaleString()}`
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatReleaseDate(releaseDate: string | null): string {
  if (!releaseDate) return 'TBA'
  const [year, month] = releaseDate.split('-')
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return `${months[parseInt(month) - 1]} ${year}`
}

export function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${month}`
}

export function getMonthName(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return `${months[parseInt(month) - 1]} ${year}`
}
