"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Filter,
  Calendar,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";

type Figure = {
  id: string;
  name: string;
  releaseDate: string | null;
  images: { url: string }[];
  brand: { name: string };
  line: { name: string };
  series: { series: { name: string } }[];
};

interface TimelineClientProps {
  lines: { id: string; name: string; brandId?: string }[];
  seriesList: {
    id: string;
    name: string;
    brandIds: string[];
    lineIds: string[];
  }[];
  brands: { id: string; name: string }[];
}

export default function TimelineClient({
  lines,
  seriesList,
  brands,
}: TimelineClientProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedLine, setSelectedLine] = useState<string>("");
  const [selectedSeries, setSelectedSeries] = useState<string>("");
  const [figures, setFigures] = useState<Figure[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // --- Filter Logic ---

  // Filter Lines based on Brand
  const filteredLines = useMemo(() => {
    if (!selectedBrand) return lines;
    return lines.filter((l) => l.brandId === selectedBrand);
  }, [lines, selectedBrand]);

  // Filter Series based on Brand AND Line
  const filteredSeries = useMemo(() => {
    return seriesList.filter((s) => {
      const matchBrand = selectedBrand
        ? s.brandIds.includes(selectedBrand)
        : true;
      const matchLine = selectedLine ? s.lineIds.includes(selectedLine) : true;
      return matchBrand && matchLine;
    });
  }, [seriesList, selectedBrand, selectedLine]);

  // Reset child filters when parent changes
  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    setSelectedLine("");
    setSelectedSeries("");
  };

  const handleLineChange = (lineId: string) => {
    setSelectedLine(lineId);
    setSelectedSeries("");
  };

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!selectedLine && !selectedSeries && !selectedBrand) {
        setFigures([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);
      try {
        const params = new URLSearchParams();
        if (selectedBrand) params.append("brandId", selectedBrand);
        if (selectedLine) params.append("lineId", selectedLine);
        if (selectedSeries) params.append("seriesId", selectedSeries);

        const res = await fetch(`/api/timeline?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setFigures(data.figures);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [selectedBrand, selectedLine, selectedSeries]);

  // Group figures by Year for the timeline markers
  const groupedFigures = figures.reduce((acc, figure) => {
    const year = figure.releaseDate
      ? new Date(figure.releaseDate).getFullYear().toString()
      : "TBA";
    if (!acc[year]) acc[year] = [];
    acc[year].push(figure);
    return acc;
  }, {} as Record<string, Figure[]>);

  const sortedYears = Object.keys(groupedFigures).sort();

  return (
    <div className="flex-1 bg-background pb-20 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-2 md:px-4 pt-2 md:pt-8 relative z-10">
        {/* Header & Filters */}
        <div className="mb-6 md:mb-16 text-left md:text-center space-y-4 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-xl md:text-6xl font-title font-black text-white mb-1 md:mb-4">
              Time
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
                Line
              </span>
            </h1>
            <p className="text-gray-400 md:max-w-2xl md:mx-auto text-sm md:text-base">
              Visualiza la evolución de tus colecciones favoritas a través de
              los años. Selecciona una línea o serie para comenzar.
            </p>
          </motion.div>

          {/* Mobile Filter Toggle */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden flex items-center justify-center gap-2 bg-white/5 px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/10 w-full"
          >
            <SlidersHorizontal size={16} className="text-primary" />
            <span className="text-sm font-medium text-white">Filtros</span>
            <motion.div
              animate={{ rotate: filtersOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} className="text-gray-400" />
            </motion.div>
          </motion.button>

          {/* Filters Container - Mobile Collapsible */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden overflow-hidden w-full"
              >
                <div className="flex flex-wrap justify-center gap-2 bg-white/5 p-3 rounded-xl backdrop-blur-md border border-white/10 shadow-xl">
                  {/* Brand Select */}
                  <div className="relative w-full">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
                      Marca
                    </p>
                    <select
                      value={selectedBrand}
                      onChange={(e) => handleBrandChange(e.target.value)}
                      className="w-full appearance-none bg-black/40 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer text-center"
                    >
                      <option
                        value=""
                        disabled
                        className="bg-[#1a1a1a] text-gray-400"
                      >
                        Selecciona una Marca
                      </option>
                      {brands.map((b) => (
                        <option
                          key={b.id}
                          value={b.id}
                          className="bg-[#1a1a1a] text-white"
                        >
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-2 top-[calc(50%+2px)] -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={16}
                    />
                  </div>

                  {/* Line Select */}
                  <div className="relative w-full">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
                      Línea
                    </p>
                    <select
                      value={selectedLine}
                      onChange={(e) => handleLineChange(e.target.value)}
                      disabled={!selectedBrand}
                      className="w-full appearance-none bg-black/40 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
                    >
                      <option value="" className="bg-[#1a1a1a] text-gray-400">
                        Selecciona una Línea
                      </option>
                      {filteredLines.map((l) => (
                        <option
                          key={l.id}
                          value={l.id}
                          className="bg-[#1a1a1a] text-white"
                        >
                          {l.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-2 top-[calc(50%+2px)] -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={16}
                    />
                  </div>

                  {/* Series Select */}
                  <div className="relative w-full">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
                      Serie
                    </p>
                    <select
                      value={selectedSeries}
                      onChange={(e) => setSelectedSeries(e.target.value)}
                      className="w-full appearance-none bg-black/40 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer text-center"
                    >
                      <option value="" className="bg-[#1a1a1a] text-gray-400">
                        Todas las Series
                      </option>
                      {filteredSeries.map((s) => (
                        <option
                          key={s.id}
                          value={s.id}
                          className="bg-[#1a1a1a] text-white"
                        >
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-2 top-[calc(50%+2px)] -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters Container - Desktop Always Visible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden md:flex flex-wrap justify-center gap-4 bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/10 max-w-4xl mx-auto shadow-xl"
          >
            {/* Brand Select */}
            <div className="relative w-full sm:w-auto sm:min-w-[200px]">
              <p className="text-[10px] md:text-xs text-gray-400 uppercase font-bold mb-0.5 md:mb-1">
                Marca
              </p>
              <select
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full appearance-none bg-black/40 border border-white/10 rounded-lg md:rounded-xl pl-3 md:pl-4 pr-8 md:pr-10 py-2 md:py-3 text-sm md:text-base text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer text-center sm:text-left"
              >
                <option
                  value=""
                  disabled
                  className="bg-[#1a1a1a] text-gray-400"
                >
                  Selecciona una Marca
                </option>
                {brands.map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    className="bg-[#1a1a1a] text-white"
                  >
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-2 md:right-3 top-[calc(50%+2px)] -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>

            {/* Line Select */}
            <div className="relative w-full sm:w-auto sm:min-w-[200px]">
              <p className="text-[10px] md:text-xs text-gray-400 uppercase font-bold mb-0.5 md:mb-1">
                Línea
              </p>
              <select
                value={selectedLine}
                onChange={(e) => handleLineChange(e.target.value)}
                disabled={!selectedBrand}
                className="w-full appearance-none bg-black/40 border border-white/10 rounded-lg md:rounded-xl pl-3 md:pl-4 pr-8 md:pr-10 py-2 md:py-3 text-sm md:text-base text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center sm:text-left"
              >
                <option value="" className="bg-[#1a1a1a] text-gray-400">
                  Selecciona una Línea
                </option>
                {filteredLines.map((l) => (
                  <option
                    key={l.id}
                    value={l.id}
                    className="bg-[#1a1a1a] text-white"
                  >
                    {l.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-2 md:right-3 top-[calc(50%+2px)] -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>

            {/* Series Select */}
            <div className="relative w-full sm:w-auto sm:min-w-[200px]">
              <p className="text-[10px] md:text-xs text-gray-400 uppercase font-bold mb-0.5 md:mb-1">
                Serie
              </p>
              <select
                value={selectedSeries}
                onChange={(e) => setSelectedSeries(e.target.value)}
                className="w-full appearance-none bg-black/40 border border-white/10 rounded-lg md:rounded-xl pl-3 md:pl-4 pr-8 md:pr-10 py-2 md:py-3 text-sm md:text-base text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer text-center sm:text-left"
              >
                <option value="" className="bg-[#1a1a1a] text-gray-400">
                  Todas las Series
                </option>
                {filteredSeries.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                    className="bg-[#1a1a1a] text-white"
                  >
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-2 md:right-3 top-[calc(50%+2px)] -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>
          </motion.div>
        </div>

        {/* Timeline Content */}
        <div className="relative min-h-[500px]">
          {loading ? (
            <div className="flex justify-center pt-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !hasSearched || figures.length === 0 ? (
            <div className="text-center py-20 opacity-50">
              {hasSearched ? (
                <p className="text-xl">
                  No se encontraron figuras con estos filtros.
                </p>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                    <Filter size={32} className="text-primary" />
                  </div>
                  <p className="text-xl">
                    Selecciona filtros para generar la línea del tiempo.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              {/* Central Line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 md:w-1 bg-gradient-to-b from-primary via-white/20 to-transparent transform md:-translate-x-1/2" />

              <div className="space-y-12 md:space-y-24 pb-20">
                {sortedYears.map((year) => (
                  <div key={year} className="relative">
                    {/* Year Marker */}
                    <div className="sticky top-24 z-20 flex justify-start md:justify-center mb-8 pl-12 md:pl-0">
                      <div className="bg-background/80 backdrop-blur border border-primary/30 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(225,6,44,0.2)]">
                        <span className="text-2xl font-title font-bold text-primary">
                          {year}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-12">
                      {groupedFigures[year].map((figure, index) => {
                        // Calculate global index effectively for staggering
                        const isLeft = index % 2 === 0;
                        return (
                          <motion.div
                            key={figure.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative flex flex-col md:flex-row items-center ${
                              isLeft ? "md:flex-row-reverse" : ""
                            } gap-8 md:gap-0`}
                          >
                            {/* Content Side */}
                            <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-12">
                              <Link
                                href={`/catalog/${figure.id}`}
                                className="block group"
                              >
                                <div
                                  className={`bg-uiBase/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_-10px_rgba(225,6,44,0.3)] flex gap-4 items-center ${
                                    isLeft
                                      ? "md:flex-row-reverse md:text-right"
                                      : ""
                                  }`}
                                >
                                  {/* Image Thumbnail */}
                                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-black/40 overflow-hidden border border-white/5 flex-shrink-0 group-hover:scale-105 transition-transform">
                                    {figure.images[0] ? (
                                      <img
                                        src={figure.images[0].url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                                        <Search size={20} />
                                      </div>
                                    )}
                                  </div>

                                  {/* Text Info */}
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className={`flex items-center gap-2 text-xs text-gray-400 mb-1 ${
                                        isLeft ? "md:justify-end" : ""
                                      }`}
                                    >
                                      <Calendar size={12} />
                                      <span>
                                        {figure.releaseDate
                                          ? new Date(
                                              figure.releaseDate
                                            ).toLocaleDateString("es-MX", {
                                              month: "long",
                                              day: "numeric",
                                            })
                                          : "Fecha pendiente"}
                                      </span>
                                    </div>
                                    <h3 className="text-white font-bold truncate group-hover:text-primary transition-colors">
                                      {figure.name}
                                    </h3>
                                    <p className="text-sm text-gray-400 truncate">
                                      {figure.line.name}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            </div>

                            {/* Timeline Dot & Connector */}
                            <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-background border-4 border-primary rounded-full transform -translate-x-1/2 z-10 shadow-[0_0_15px_rgba(225,6,44,0.6)]">
                              <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
                            </div>

                            {/* Mobile Connector Line (Horizontal) */}
                            <div className="md:hidden absolute left-4 w-8 h-0.5 bg-white/10 top-1/2 transform -translate-y-1/2" />

                            {/* Spacer for the other side */}
                            <div className="w-full md:w-1/2 hidden md:block" />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
