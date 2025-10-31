"use client"

import { useEffect, useState } from "react"
import { getLatestCandles } from "@/lib/api"
import { symbols } from "@/lib/symbols"

interface TickerItem {
  symbol: string
  price: number
  change: number
  pctChange: number
}

// Symbols to display in ticker tape - mix of overview indices and stocks
const tickerSymbols = [
  ...symbols.overview,
  ...symbols.stocks.tech,
  ...symbols.forex.major.slice(0, 3),
  ...symbols.crypto.major.slice(0, 3),
]

export function TickerTape() {
  const [currentData, setCurrentData] = useState<TickerItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch initial data from API
  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        const dataPromises = tickerSymbols.map(async (symbol) => {
          try {
            const candles = await getLatestCandles(symbol, 2)
            if (candles.length >= 2) {
              const latest = candles[candles.length - 1]
              const previous = candles[candles.length - 2]
              const change = latest.close - previous.close
              const pctChange = (change / previous.close) * 100
              
              return {
                symbol,
                price: latest.close,
                change,
                pctChange,
              }
            }
            // Fallback if not enough data
            return {
              symbol,
              price: 0,
              change: 0,
              pctChange: 0,
            }
          } catch (err) {
            // Fallback for symbols without data
            return {
              symbol,
              price: 0,
              change: 0,
              pctChange: 0,
            }
          }
        })

        const data = await Promise.all(dataPromises)
        // Filter out symbols with no data
        const validData = data.filter(item => item.price > 0)
        setCurrentData(validData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching ticker data:", error)
        setIsLoading(false)
      }
    }

    fetchTickerData()
    
    // Refresh data every 10 seconds
    const interval = setInterval(fetchTickerData, 10000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading || currentData.length === 0) {
    return (
      <div className="bg-black text-white overflow-hidden whitespace-nowrap py-1">
        <div className="ticker-scroll-extra-slow inline-flex space-x-8">
          <span className="text-gray-500 text-sm">Loading market data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black text-white overflow-hidden whitespace-nowrap py-1">
      <div className="ticker-scroll-extra-slow inline-flex space-x-8">
        {/* Repeat the data multiple times for seamless looping */}
        {Array(6)
          .fill(currentData)
          .flat()
          .map((item, index) => (
            <div key={`${item.symbol}-${index}`} className="inline-flex items-center space-x-2 text-sm flex-shrink-0">
              <span className="text-[#ff9800] font-bold">{item.symbol}</span>
              <span className="text-yellow-100">
                {item.price < 1 ? item.price.toFixed(4) : item.price.toFixed(2)}
              </span>
              <span className={item.change >= 0 ? "text-green-500" : "text-red-500"}>
                {item.change >= 0 ? "+" : ""}
                {Math.abs(item.change) < 1 ? item.change.toFixed(4) : item.change.toFixed(2)}
              </span>
              <span className={item.pctChange >= 0 ? "text-green-500" : "text-red-500"}>
                ({item.pctChange >= 0 ? "+" : ""}
                {item.pctChange.toFixed(2)}%)
              </span>
            </div>
          ))}
      </div>
    </div>
  )
}
