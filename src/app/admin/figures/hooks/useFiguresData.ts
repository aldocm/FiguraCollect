'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Figure, Brand, Line, Series, TagType, Character } from '../types'

const ITEMS_PER_PAGE = 12
const SEARCH_DEBOUNCE_MS = 400

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface FiguresData {
  figures: Figure[]
  brands: Brand[]
  lines: Line[]
  seriesList: Series[]
  tags: TagType[]
  characters: Character[]
  loading: boolean
  loadingFigures: boolean
  pagination: Pagination
  searchTerm: string
  isSearching: boolean
  setFigures: React.Dispatch<React.SetStateAction<Figure[]>>
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>
  setSeriesList: React.Dispatch<React.SetStateAction<Series[]>>
  setPage: (page: number) => void
  setSearchTerm: (term: string) => void
  refetch: () => Promise<void>
}

export function useFiguresData(): FiguresData {
  const [figures, setFigures] = useState<Figure[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [lines, setLines] = useState<Line[]>([])
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingFigures, setLoadingFigures] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    pages: 0
  })

  // Search state
  const [searchTerm, setSearchTermState] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [cachedPageFigures, setCachedPageFigures] = useState<Figure[]>([])
  const [cachedPagination, setCachedPagination] = useState<Pagination | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch figures with pagination and optional search
  const fetchFigures = useCallback(async (page: number, search?: string) => {
    setLoadingFigures(true)
    try {
      let url = `/api/figures?includeAll=true&page=${page}&limit=${ITEMS_PER_PAGE}`
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`
      }
      const res = await fetch(url)
      const data = await res.json()
      setFigures(data.figures)
      setPagination(data.pagination)

      // Cache the page results when not searching
      if (!search || !search.trim()) {
        setCachedPageFigures(data.figures)
        setCachedPagination(data.pagination)
      }
    } finally {
      setLoadingFigures(false)
    }
  }, [])

  // Fetch all static data (brands, lines, etc.)
  const fetchStaticData = useCallback(async () => {
    const [brandsRes, linesRes, seriesRes, tagsRes, charactersRes] = await Promise.all([
      fetch('/api/brands'),
      fetch('/api/lines'),
      fetch('/api/series'),
      fetch('/api/tags'),
      fetch('/api/characters')
    ])

    const [brandsData, linesData, seriesData, tagsData, charactersData] = await Promise.all([
      brandsRes.json(),
      linesRes.json(),
      seriesRes.json(),
      tagsRes.json(),
      charactersRes.json()
    ])

    setBrands(brandsData.brands)
    setLines(linesData.lines)
    setSeriesList(seriesData.series)
    setTags(tagsData.tags)
    setCharacters(charactersData.characters)
  }, [])

  // Initial load
  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchFigures(1),
        fetchStaticData()
      ])
      setLoading(false)
    }
    init()
  }, [fetchFigures, fetchStaticData])

  // Handle page change
  const setPage = useCallback((page: number) => {
    setCurrentPage(page)
    fetchFigures(page, searchTerm)
  }, [fetchFigures, searchTerm])

  // Handle search with debounce
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // If clearing search, restore cached page results immediately
    if (!term.trim()) {
      setIsSearching(false)
      if (cachedPageFigures.length > 0 && cachedPagination) {
        setFigures(cachedPageFigures)
        setPagination(cachedPagination)
      }
      return
    }

    // Debounce the search
    setIsSearching(true)
    debounceRef.current = setTimeout(() => {
      fetchFigures(1, term)
      setIsSearching(false)
    }, SEARCH_DEBOUNCE_MS)
  }, [fetchFigures, cachedPageFigures, cachedPagination])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Refetch current page
  const refetch = useCallback(async () => {
    await fetchFigures(currentPage, searchTerm)
  }, [fetchFigures, currentPage, searchTerm])

  return {
    figures,
    brands,
    lines,
    seriesList,
    tags,
    characters,
    loading,
    loadingFigures,
    pagination,
    searchTerm,
    isSearching,
    setFigures,
    setCharacters,
    setSeriesList,
    setPage,
    setSearchTerm,
    refetch
  }
}
