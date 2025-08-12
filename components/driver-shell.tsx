"use client"

import type { ReactNode } from "react"
import { TopBar } from "@/components/top-bar"
import { DriverBottomNav } from "@/components/driver-bottom-nav"
import { Toaster } from "@/components/ui/toaster"
import { useAppStore } from "@/store/use-store"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function DriverShell({ children }: { children: ReactNode }) {
  const role = useAppStore((s) => s.ui.role)
  const router = useRouter()

  // Guard suave: si el rol es operativo, llévalo al área Ops
  useEffect(() => {
    if (["Operator", "Site Manager", "Admin-lite", "Technician"].includes(role)) {
      router.replace("/ops")
    }
  }, [role, router])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <TopBar />
      </header>
      <main className="pb-20">{children}</main>
      <nav className="fixed bottom-0 inset-x-0 z-50">
        <DriverBottomNav />
      </nav>
      <Toaster />
    </div>
  )
}
