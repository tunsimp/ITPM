"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { Sidebar } from "./sidebar"
import { getCurrentUser } from "@/lib/auth"

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, user, login } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated && !user) {
        const currentUser = await getCurrentUser().catch(() => null)
        if (currentUser) {
          login(currentUser)
        } else {
          router.push("/login")
          return
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [isAuthenticated, user, login, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  )
}
