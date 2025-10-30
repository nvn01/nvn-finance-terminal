"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate login verification
    setTimeout(() => {
      if (username === "admin" && password === "admin123") {
        localStorage.setItem("isAuthenticated", "true")
        router.push("/loading")
      } else {
        setError("Invalid credentials")
        setIsLoading(false)
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
      <div className="bg-[#1a1a1a] border border-gray-700 p-8 rounded-lg w-96">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#ff9800] mb-2"> NOVN TERMINAL</h1>
          <p className="text-gray-400 text-sm">Financial Data Platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-[#ff9800]"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-[#ff9800]"
              placeholder="Enter password"
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ff9800] text-black py-2 rounded font-medium hover:bg-[#e68900] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Authenticating..." : "LOGIN"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Demo Credentials:</p>
          <p>Username: admin | Password: admin123</p>
        </div>
      </div>
    </div>
  )
}
