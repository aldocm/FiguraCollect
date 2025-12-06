import { Package, Box, Layers, Tag, LucideIcon } from 'lucide-react'

// ==========================================
// SEARCH TYPES
// ==========================================

export type SearchResultType = 'figure' | 'brand' | 'line' | 'series'

export interface SearchResult {
  id: string
  name: string
  type: SearchResultType
  image?: string
  subtitle?: string
}

// ==========================================
// SEARCH HELPERS
// ==========================================

/**
 * Get the appropriate icon for a search result type
 */
export function getSearchTypeIcon(type: SearchResultType): LucideIcon {
  switch (type) {
    case 'figure': return Package
    case 'brand': return Box
    case 'line': return Layers
    case 'series': return Tag
    default: return Package
  }
}

/**
 * Get the Spanish label for a search result type
 */
export function getSearchTypeLabel(type: SearchResultType): string {
  switch (type) {
    case 'figure': return 'Figura'
    case 'brand': return 'Marca'
    case 'line': return 'Línea'
    case 'series': return 'Serie'
    default: return type
  }
}

/**
 * Build the navigation path for a search result
 */
export function getSearchResultPath(result: SearchResult): string {
  switch (result.type) {
    case 'figure':
      return `/catalog/${result.id}`
    case 'brand':
      return `/catalog?brandId=${result.id}`
    case 'line':
      return `/catalog?lineId=${result.id}`
    case 'series':
      return `/catalog?seriesId=${result.id}`
    default:
      return '/catalog'
  }
}
