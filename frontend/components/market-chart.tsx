"use client"

import { useEffect, useRef } from "react"

interface ChartData {
  time: string
  price: number
  volume: number
}

interface MarketChartProps {
  data: ChartData[]
  isDarkMode: boolean
}

export function MarketChart({ data, isDarkMode }: MarketChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data.length) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const padding = { top: 20, right: 60, bottom: 40, left: 20 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Clear canvas with black background instead of blue
    ctx.fillStyle = "#000000" // Black background like Bloomberg
    ctx.fillRect(0, 0, width, height)

    // Draw grid with subtle gray lines
    ctx.strokeStyle = "#333333" // Dark gray for grid
    ctx.lineWidth = 1
    ctx.setLineDash([1, 2]) // Subtle dotted lines

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding.left + (chartWidth / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, height - padding.bottom)
      ctx.stroke()
    }

    // Horizontal grid lines
    for (let i = 0; i <= 8; i++) {
      const y = padding.top + (chartHeight / 8) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
    }

    ctx.setLineDash([]) // Reset to solid lines

    // Calculate price range
    const prices = data.map((d) => d.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice

    // Create path for filled area under the line
    const fillPath = new Path2D()
    let firstPoint = true

    data.forEach((point, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index
      const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight

      if (firstPoint) {
        fillPath.moveTo(x, height - padding.bottom)
        fillPath.lineTo(x, y)
        firstPoint = false
      } else {
        fillPath.lineTo(x, y)
      }
    })

    // Close the fill path
    const lastX = padding.left + chartWidth
    fillPath.lineTo(lastX, height - padding.bottom)
    fillPath.closePath()

    // Fill the area under the line with blue gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
    gradient.addColorStop(0, "rgba(33, 150, 243, 0.3)") // Light blue at top
    gradient.addColorStop(1, "rgba(33, 150, 243, 0.1)") // Transparent at bottom

    ctx.fillStyle = gradient
    ctx.fill(fillPath)

    // Draw price line in white
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((point, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index
      const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw price labels on right axis in white
    ctx.fillStyle = "#ffffff"
    ctx.font = "12px monospace"
    ctx.textAlign = "left"

    for (let i = 0; i <= 8; i++) {
      const price = maxPrice - (priceRange / 8) * i
      const y = padding.top + (chartHeight / 8) * i
      ctx.fillText(price.toFixed(2), width - padding.right + 5, y + 4)
    }

    // Draw time labels on bottom axis in white
    ctx.textAlign = "center"
    const timeLabels = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
    timeLabels.forEach((label, index) => {
      const x = padding.left + (chartWidth / (timeLabels.length - 1)) * index
      ctx.fillText(label, x, height - padding.bottom + 20)
    })

    // Draw current price indicator with orange color
    const lastPrice = prices[prices.length - 1]
    const lastY = padding.top + chartHeight - ((lastPrice - minPrice) / priceRange) * chartHeight

    // Price line in orange
    ctx.strokeStyle = "#ff9800"
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(padding.left, lastY)
    ctx.lineTo(width - padding.right, lastY)
    ctx.stroke()
    ctx.setLineDash([])

    // Price label with orange background
    ctx.fillStyle = "#ff9800"
    ctx.fillRect(width - padding.right + 2, lastY - 10, 50, 20)
    ctx.fillStyle = "#000000"
    ctx.textAlign = "center"
    ctx.fillText(lastPrice.toFixed(2), width - padding.right + 27, lastY + 4)
  }, [data, isDarkMode])

  return (
    <div className="relative w-full h-96">
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
    </div>
  )
}
