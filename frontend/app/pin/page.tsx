"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PinPage() {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit)
    }
  }

  const handleClear = () => {
    setPin("")
    setError("")
  }

  const handleSubmit = () => {
    if (pin.length === 4) {
      setIsLoading(true)
      setTimeout(() => {
        if (pin === "1234") {
          router.push("/home")
        } else {
          setError("Invalid PIN")
          setPin("")
          setIsLoading(false)
        }
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
      <div className="bg-[#1a1a1a] border border-gray-700 p-8 rounded-lg w-96">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-[#ff9800] mb-2">SECURITY PIN</h1>
          <p className="text-gray-400 text-sm">Enter your 4-digit PIN</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-center space-x-4 mb-4">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="w-12 h-12 border-2 border-gray-600 rounded flex items-center justify-center text-xl"
              >
                {pin[index] ? "●" : ""}
              </div>
            ))}
          </div>

          {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handlePinInput(digit.toString())}
              className="bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-gray-600 rounded py-3 text-lg font-medium"
              disabled={isLoading}
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-gray-600 rounded py-3 text-sm"
            disabled={isLoading}
          >
            CLEAR
          </button>
          <button
            onClick={() => handlePinInput("0")}
            className="bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-gray-600 rounded py-3 text-lg font-medium"
            disabled={isLoading}
          >
            0
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#ff9800] hover:bg-[#e68900] text-black rounded py-3 text-sm font-medium disabled:opacity-50"
            disabled={pin.length !== 4 || isLoading}
          >
            {isLoading ? "..." : "ENTER"}
          </button>
        </div>

        <div className="text-center text-xs text-gray-500">Demo PIN: 1234</div>
      </div>
    </div>
  )
}
