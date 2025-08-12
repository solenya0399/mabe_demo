"use client"

import type { ReactNode } from "react"
import { TopBar } from "@/components/top-bar"
import { OpsBottomNav } from "@/components/ops-bottom-nav"
import { Toaster } from "@/components/ui/toaster"
import { useAppStore } from "@/store/use-store"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { hasOpsPermission } from "@/store/use-store"

export function OpsShell({ children }: { children: ReactNode }) {
  const role = useAppStore((s) => s.ui.role)
  const router = useRouter()

  // Redirige a Driver si no tiene permisos Ops
  useEffect(() => {
    if (!hasOpsPermission(role)) {
      router.replace("/driver/home")
    }
  }, [role, router])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <TopBar />
      </header>
      <main className="pb-20">{children}</main>
      <nav className="fixed bottom-0 inset-x-0 z-50">
        <OpsBottomNav />
      </nav>
      <Toaster />
    </div>
  )
}
