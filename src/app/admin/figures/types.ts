export interface Brand { id: string; name: string }
export interface Line { id: string; name: string; brandId: string }
export interface Series { id: string; name: string }
export interface TagType { id: string; name: string }
export interface Character { id: string; name: string; series: { id: string; name: string } | null }

export interface Figure {
  id: string
  name: string
  brand: Brand
  line: { name: string }
  priceMXN: number | null
  releaseDate: string | null
  isReleased: boolean
  images: { url: string }[]
}

export interface FigureFormData {
  name: string
  description: string
  sku: string
  heightCm: string
  widthCm: string
  depthCm: string
  scale: string
  material: string
  maker: string
  priceMXN: string
  priceUSD: string
  priceYEN: string
  originalPriceCurrency: 'MXN' | 'USD' | 'YEN'
  releaseDate: string
  isReleased: boolean
  isNSFW: boolean
  brandId: string
  lineId: string
  characterId: string
  images: string
  tagIds: string[]
  seriesIds: string[]
}

export const INITIAL_FORM_DATA: FigureFormData = {
  name: '',
  description: '',
  sku: '',
  heightCm: '',
  widthCm: '',
  depthCm: '',
  scale: '',
  material: '',
  maker: '',
  priceMXN: '',
  priceUSD: '',
  priceYEN: '',
  originalPriceCurrency: 'YEN',
  releaseDate: '',
  isReleased: false,
  isNSFW: false,
  brandId: '',
  lineId: '',
  characterId: '',
  images: '',
  tagIds: [],
  seriesIds: []
}

export type ViewMode = 'catalog' | 'pending'
