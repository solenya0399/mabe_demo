"use client"

import type { ReactNode } from "react"
import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { Toaster } from "@/components/ui/toaster"

export function AppScaffold({ children }: { children: ReactNode }) {
  // Sin efectos para evitar bucles: el ThemeProvider del layout se encarga del tema.
  // Zustand persist hidrata automáticamente; no es necesario "hydrateFromStorage".
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <TopBar />
      </header>
      <main className="pb-20">{children}</main>
      <nav className="fixed bottom-0 inset-x-0 z-50">
        <BottomNav />
      </nav>
      <Toaster />
    </div>
  )
}
