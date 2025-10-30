"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useEffect, useMemo, useState } from "react"

interface MarketOverviewCarouselProps {
  marketData: any[]
  currentIndex: number
  setCurrentIndex: (index: number) => void
  isDarkMode: boolean
}

// Generate more realistic chart data with variations
const generateRealisticChartData = (baseData: any[], changePercent: number) => {
  return baseData.map((item, index) => {
    // Create more variation based on the change percent
    const volatility = Math.abs(changePercent) * 0.1 + 0.5
    const trend = changePercent > 0 ? 1 : -1
    
    // Add random variations with trend influence
    const randomVariation = (Math.random() - 0.5) * volatility * 10
    const trendInfluence = trend * (index / baseData.length) * Math.abs(changePercent) * 2
    
    return {
      ...item,
      value: item.value + randomVariation + trendInfluence
    }
  })
}

export function MarketOverviewCarousel({ 
  marketData, 
  currentIndex, 
  setCurrentIndex, 
  isDarkMode 
}: MarketOverviewCarouselProps) {
  if (!marketData || marketData.length === 0) {
    return (
      <div className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
        No overview data.
      </div>
    )
  }

  const safeIndex = Math.max(0, Math.min(currentIndex, marketData.length - 1))
  const currentMarket = marketData[safeIndex] || {}

  // Avoid SSR/client mismatch: only add randomness after mount
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const baseData = ((currentMarket as any).chartData as any[]) || []
  const realisticChartData = useMemo(() => {
    const cp = Number((currentMarket as any).changePercent) || 0
    return mounted ? generateRealisticChartData(baseData, cp) : baseData
  }, [mounted, baseData, (currentMarket as any).changePercent])

  const nf = useMemo(() => new Intl.NumberFormat("en-US"), [])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-lg font-bold">Market Overview</h2>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setCurrentIndex((currentIndex - 1 + marketData.length) % marketData.length)
            }
            className="bg-gray-600 px-2 py-1 rounded text-white hover:bg-gray-500 text-xs"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentIndex((currentIndex + 1) % marketData.length)}
            className="bg-gray-600 px-2 py-1 rounded text-white hover:bg-gray-500 text-xs"
          >
            →
          </button>
        </div>
      </div>

      {/* Current Market Display */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-1">{currentMarket.name || "-"}</div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-2xl ${(Number(currentMarket.changePercent) || 0) >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            {(Number(currentMarket.changePercent) || 0) >= 0 ? "▲" : "▼"}
          </span>
          <span className="text-white text-3xl font-bold">
            {nf.format(Number((currentMarket as any).value || 0))}
          </span>
        </div>
        <div className="text-sm text-gray-300 grid grid-cols-3 gap-4">
          <div>
            <div className="text-gray-400">Previous Close</div>
            <div>{nf.format(Number((currentMarket as any).previousClose || 0))}</div>
          </div>
          <div>
            <div className="text-gray-400">Day Range</div>
            <div>{currentMarket.dayRange || "-"}</div>
          </div>
          <div>
            <div
              className={
                (Number(currentMarket.changePercent) || 0) >= 0 ? "text-green-400" : "text-red-400"
              }
            >
              {(Number(currentMarket.changePercent) || 0) >= 0 ? "+" : ""}
              {Number(currentMarket.change || 0).toFixed(2)}
            </div>
            <div
              className={
                (Number(currentMarket.changePercent) || 0) >= 0 ? "text-green-400" : "text-red-400"
              }
            >
              {(Number(currentMarket.changePercent) || 0) >= 0 ? "+" : ""}
              {Number(currentMarket.changePercent || 0).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Chart with realistic variations */}
      <div className="h-64 bg-black rounded">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={realisticChartData || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="time" stroke="#fff" fontSize={10} />
            <YAxis stroke="#fff" fontSize={10} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={(Number(currentMarket.changePercent) || 0) >= 0 ? "#4ade80" : "#ef4444"}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Market Indicators */}
      <div className="mt-4 flex justify-center gap-2">
        {marketData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-[#ff9800]" : "bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
