import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { SWRConfig } from "swr"

export const metadata: Metadata = {
  title: "Bloomberg Terminal",
  description: "Financial Terminal Application",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-mono">
        <SWRConfig value={{ dedupingInterval: 10000, revalidateOnFocus: true }}>
          {children}
        </SWRConfig>
      </body>
    </html>
  )
}
