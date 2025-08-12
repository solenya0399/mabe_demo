"use client"

import type { ReactNode } from "react"
import { TopBar } from "@/components/top-bar"
import { TechnicianBottomNav } from "@/components/technician-bottom-nav"
import { Toaster } from "@/components/ui/toaster"

export function TechnicianShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <TopBar />
      </header>
      <main className="pb-20">{children}</main>
      <nav className="fixed bottom-0 inset-x-0 z-50">
        <TechnicianBottomNav />
      </nav>
      <Toaster />
    </div>
  )
}
