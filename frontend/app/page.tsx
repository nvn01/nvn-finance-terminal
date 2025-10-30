"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated (you can implement proper auth logic here)
    const isAuthenticated = localStorage.getItem("isAuthenticated")

    if (!isAuthenticated) {
      router.push("/login")
    } else {
      router.push("/home")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="text-white">Redirecting...</div>
    </div>
  )
}
