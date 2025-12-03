"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, CheckSquare, BarChart3, LogOut, BookOpen, DollarSign } from "lucide-react"
import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuthStore()

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/schedule", label: "Schedule", icon: Calendar },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/grades", label: "Grades", icon: BarChart3 },
    { href: "/expenses", label: "Expenses & Income", icon: DollarSign },
  ]

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-sidebar-foreground">AcademiHub</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start gap-3">
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button variant="outline" className="w-full justify-start gap-3 bg-transparent" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  )
}
