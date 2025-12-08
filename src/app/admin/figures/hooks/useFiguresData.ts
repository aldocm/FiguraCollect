'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Figure, Brand, Line, Series, TagType, Character } from '../types'

interface FiguresData {
  figures: Figure[]
  brands: Brand[]
  lines: Line[]
  seriesList: Series[]
  tags: TagType[]
  characters: Character[]
  loading: boolean
  setFigures: React.Dispatch<React.SetStateAction<Figure[]>>
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>
  setSeriesList: React.Dispatch<React.SetStateAction<Series[]>>
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

  const fetchData = useCallback(async () => {
    const [figuresRes, brandsRes, linesRes, seriesRes, tagsRes, charactersRes] = await Promise.all([
      fetch('/api/figures?limit=100'),
      fetch('/api/brands'),
      fetch('/api/lines'),
      fetch('/api/series'),
      fetch('/api/tags'),
      fetch('/api/characters')
    ])

    const [figuresData, brandsData, linesData, seriesData, tagsData, charactersData] = await Promise.all([
      figuresRes.json(),
      brandsRes.json(),
      linesRes.json(),
      seriesRes.json(),
      tagsRes.json(),
      charactersRes.json()
    ])

    setFigures(figuresData.figures)
    setBrands(brandsData.brands)
    setLines(linesData.lines)
    setSeriesList(seriesData.series)
    setTags(tagsData.tags)
    setCharacters(charactersData.characters)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    figures,
    brands,
    lines,
    seriesList,
    tags,
    characters,
    loading,
    setFigures,
    setCharacters,
    setSeriesList,
    refetch: fetchData
  }
}
