"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoadingPage() {
  const router = useRouter()

  useEffect(() => {
    // Simulate account verification
    const timer = setTimeout(() => {
      router.push("/pin")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#ff9800] mb-4">BLOOMBERG TERMINAL</h1>
          <div className="w-64 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div className="h-full bg-[#ff9800] rounded-full animate-pulse" style={{ width: "100%" }}></div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-400">
          <p>Verifying account credentials...</p>
          <p>Loading market data...</p>
          <p>Initializing terminal...</p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff9800]"></div>
        </div>
      </div>
    </div>
  )
}
