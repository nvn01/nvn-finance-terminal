"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

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
  const currentMarket = marketData[currentIndex]
  const realisticChartData = generateRealisticChartData(
    currentMarket.chartData, 
    currentMarket.changePercent
  )

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
        <div className="text-sm text-gray-400 mb-1">{currentMarket.name}</div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-2xl ${currentMarket.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            {currentMarket.changePercent >= 0 ? "▲" : "▼"}
          </span>
          <span className="text-white text-3xl font-bold">
            {currentMarket.value.toLocaleString()}
          </span>
        </div>
        <div className="text-sm text-gray-300 grid grid-cols-3 gap-4">
          <div>
            <div className="text-gray-400">Previous Close</div>
            <div>{currentMarket.previousClose.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-400">Day Range</div>
            <div>{currentMarket.dayRange}</div>
          </div>
          <div>
            <div
              className={
                currentMarket.changePercent >= 0 ? "text-green-400" : "text-red-400"
              }
            >
              {currentMarket.changePercent >= 0 ? "+" : ""}
              {currentMarket.change.toFixed(2)}
            </div>
            <div
              className={
                currentMarket.changePercent >= 0 ? "text-green-400" : "text-red-400"
              }
            >
              {currentMarket.changePercent >= 0 ? "+" : ""}
              {currentMarket.changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Chart with realistic variations */}
      <div className="h-64 bg-black rounded">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={realisticChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="time" stroke="#fff" fontSize={10} />
            <YAxis stroke="#fff" fontSize={10} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={currentMarket.changePercent >= 0 ? "#4ade80" : "#ef4444"}
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
