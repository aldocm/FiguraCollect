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

// ==========================================
// UNIT CONVERSION UTILITIES
// ==========================================

export type MeasureUnit = 'cm' | 'in'

const CM_TO_INCH = 0.393701
const INCH_TO_CM = 2.54

/**
 * Convert centimeters to inches
 */
export function cmToInches(cm: number): number {
  return Math.round(cm * CM_TO_INCH * 100) / 100
}

/**
 * Convert inches to centimeters
 */
export function inchesToCm(inches: number): number {
  return Math.round(inches * INCH_TO_CM * 100) / 100
}

/**
 * Convert a measurement to the desired unit
 * @param valueCm - Value in centimeters (base unit stored in DB)
 * @param targetUnit - Target unit to convert to
 */
export function convertMeasure(valueCm: number | null, targetUnit: MeasureUnit): number | null {
  if (valueCm === null) return null
  return targetUnit === 'cm' ? valueCm : cmToInches(valueCm)
}

/**
 * Format a dimension value with its unit
 */
export function formatDimension(valueCm: number | null, unit: MeasureUnit): string {
  if (valueCm === null) return '-'
  const value = convertMeasure(valueCm, unit)
  return `${value} ${unit}`
}

/**
 * Format full dimensions (H x W x D)
 */
export function formatDimensions(
  heightCm: number | null,
  widthCm: number | null,
  depthCm: number | null,
  unit: MeasureUnit
): string {
  const h = convertMeasure(heightCm, unit)
  const w = convertMeasure(widthCm, unit)
  const d = convertMeasure(depthCm, unit)

  const parts: string[] = []
  if (h !== null) parts.push(`${h}`)
  if (w !== null) parts.push(`${w}`)
  if (d !== null) parts.push(`${d}`)

  if (parts.length === 0) return '-'
  return `${parts.join(' × ')} ${unit}`
}

/**
 * Get user-friendly unit label
 */
export function getUnitLabel(unit: MeasureUnit): string {
  return unit === 'cm' ? 'Centímetros' : 'Pulgadas'
}

// ==========================================
// PRICING UTILITIES
// ==========================================

type CurrencyType = 'MXN' | 'USD' | 'YEN'

interface FigureWithPrices {
  priceMXN?: number | null
  priceUSD?: number | null
  priceYEN?: number | null
  originalPriceCurrency?: string | null
}

/**
 * Format a figure's price based on its original currency
 */
export function formatFigurePrice(figure: FigureWithPrices): string | null {
  const currency = (figure.originalPriceCurrency as CurrencyType) || 'YEN'

  switch (currency) {
    case 'MXN':
      return figure.priceMXN ? `$${figure.priceMXN.toLocaleString('es-MX')} MXN` : null
    case 'USD':
      return figure.priceUSD ? `$${figure.priceUSD.toLocaleString('en-US')} USD` : null
    case 'YEN':
    default:
      return figure.priceYEN ? `¥${figure.priceYEN.toLocaleString('ja-JP')}` : null
  }
}

// ==========================================
// RATING UTILITIES
// ==========================================

interface ReviewWithRating {
  rating: number
}

/**
 * Calculate average rating from reviews array
 */
export function calculateAverageRating(reviews: ReviewWithRating[]): number {
  if (!reviews || reviews.length === 0) return 0
  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return total / reviews.length
}

// ==========================================
// INVENTORY CONSTANTS
// ==========================================

export const INVENTORY_STATUSES = ['WISHLIST', 'PREORDER', 'OWNED'] as const
export type InventoryStatus = typeof INVENTORY_STATUSES[number]

export function isValidInventoryStatus(status: string): status is InventoryStatus {
  return INVENTORY_STATUSES.includes(status as InventoryStatus)
}
