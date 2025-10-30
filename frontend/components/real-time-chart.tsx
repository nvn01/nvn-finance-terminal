"use client"

import { useEffect, useRef } from "react"

interface RealTimeChartProps {
  data: any
  width?: number
  height?: number
  isDarkMode: boolean
}

export function RealTimeChart({ data, width = 80, height = 20, isDarkMode }: RealTimeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set proper scaling for retina displays
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Set canvas size in CSS pixels
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // Generate realistic chart data based on market data
    const generateChartData = () => {
      const points = 20
      const baseValue = data.value
      const volatility = Math.abs(data.pctChange) * 0.1
      const trend = data.change > 0 ? 1 : -1

      const chartData = []
      let currentValue = baseValue - data.change * 0.8 // Start from earlier value

      for (let i = 0; i < points; i++) {
        // Add some realistic market movement
        const randomChange = (Math.random() - 0.5) * volatility * baseValue * 0.01
        const trendInfluence = trend * volatility * baseValue * 0.005 * (i / points)

        currentValue += randomChange + trendInfluence
        chartData.push(currentValue)
      }

      // Ensure the last point matches current value
      chartData[chartData.length - 1] = baseValue

      return chartData
    }

    const chartData = generateChartData()

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    if (chartData.length < 2) return

    const minValue = Math.min(...chartData)
    const maxValue = Math.max(...chartData)
    const valueRange = maxValue - minValue || 1

    const padding = 2
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding

    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
    const color = data.change >= 0 ? "#4CAF50" : "#EF4444"
    gradient.addColorStop(0, color + "40") // 25% opacity
    gradient.addColorStop(1, color + "10") // 6% opacity

    // Draw filled area
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)

    chartData.forEach((value, index) => {
      const x = padding + (index / (chartData.length - 1)) * chartWidth
      const y = padding + (1 - (value - minValue) / valueRange) * chartHeight

      if (index === 0) {
        ctx.lineTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.lineTo(width - padding, height - padding)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw line
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    chartData.forEach((value, index) => {
      const x = padding + (index / (chartData.length - 1)) * chartWidth
      const y = padding + (1 - (value - minValue) / valueRange) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Add a subtle glow effect
    ctx.shadowColor = color
    ctx.shadowBlur = 2
    ctx.stroke()
    ctx.shadowBlur = 0
  }, [data, width, height, isDarkMode])

  return <canvas ref={canvasRef} width={width} height={height} className="inline-block" />
}
