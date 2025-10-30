"use client"

import { useEffect, useState } from "react"

interface TickerItem {
  symbol: string
  price: number
  change: number
  pctChange: number
}

const tickerData: TickerItem[] = [
  { symbol: "AAPL", price: 175.43, change: 2.15, pctChange: 1.24 },
  { symbol: "GOOGL", price: 2847.63, change: -15.32, pctChange: -0.53 },
  { symbol: "MSFT", price: 338.11, change: 4.87, pctChange: 1.46 },
  { symbol: "TSLA", price: 248.5, change: -8.23, pctChange: -3.2 },
  { symbol: "AMZN", price: 3342.88, change: 12.45, pctChange: 0.37 },
  { symbol: "NVDA", price: 465.23, change: 18.76, pctChange: 4.2 },
  { symbol: "META", price: 298.75, change: -5.42, pctChange: -1.78 },
  { symbol: "NFLX", price: 445.12, change: 8.93, pctChange: 2.05 },
  { symbol: "AMD", price: 112.34, change: -2.67, pctChange: -2.32 },
  { symbol: "INTC", price: 45.78, change: 1.23, pctChange: 2.76 },
  { symbol: "CRM", price: 234.56, change: 6.78, pctChange: 2.98 },
  { symbol: "ORCL", price: 89.45, change: -1.34, pctChange: -1.47 },
  { symbol: "IBM", price: 156.78, change: 3.21, pctChange: 2.09 },
  { symbol: "CSCO", price: 52.34, change: 0.87, pctChange: 1.69 },
  { symbol: "ADBE", price: 567.89, change: -12.45, pctChange: -2.15 },
  { symbol: "PYPL", price: 78.9, change: 2.34, pctChange: 3.06 },
]

export function TickerTape() {
  const [currentData, setCurrentData] = useState(tickerData)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentData((prev) =>
        prev.map((item) => ({
          ...item,
          price: item.price + (Math.random() - 0.5) * 2,
          change: item.change + (Math.random() - 0.5) * 0.5,
          pctChange: item.pctChange + (Math.random() - 0.5) * 0.2,
        })),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

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
              <span className="text-yellow-100">{item.price.toFixed(2)}</span>
              <span className={item.change >= 0 ? "text-green-500" : "text-red-500"}>
                {item.change >= 0 ? "+" : ""}
                {item.change.toFixed(2)}
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
