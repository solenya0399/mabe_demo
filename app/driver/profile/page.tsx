"use client"

import Link from "next/link"
import { DriverShell } from "@/components/driver-shell"
import { useAppStore } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Info, RefreshCw, Settings, Smartphone, SunMoon, Car, FileStack } from "lucide-react"
import { exportReservationsCSV, exportSessionsCSV } from "@/lib/csv"

export default function DriverProfilePage() {
  const resetDemo = useAppStore((s) => s.resetDemo)
  const theme = useAppStore((s) => s.ui.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const setSiteId = useAppStore((s) => s.setCurrentSite)
  const sites = useAppStore((s) => s.sites)

  return (
    <DriverShell>
      <div className="p-4 space-y-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" /> Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid grid-cols-2 items-center gap-2">
              <div className="text-sm">Theme</div>
              <div className="justify-self-end">
                <Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  <SunMoon className="h-4 w-4 mr-2" /> {theme === "dark" ? "Light" : "Dark"}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <div className="text-sm">Site</div>
              <div className="justify-self-end">
                <select
                  className="bg-muted px-3 py-2 rounded-lg text-sm"
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="h-4 w-4" /> Shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            <Link href="/driver/garage">
              <Button variant="outline">
                <Car className="h-4 w-4 mr-2" /> Garage
              </Button>
            </Link>
            <Link href="/driver/reserve">
              <Button variant="outline">
                <FileStack className="h-4 w-4 mr-2" /> Reserve
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4" /> Export
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" onClick={() => exportReservationsCSV()}>
              Reservations CSV
            </Button>
            <Button variant="outline" onClick={() => exportSessionsCSV()}>
              Sessions CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Link href="/reset" className="ml-auto">
              <Button variant="outline">
                <Smartphone className="h-4 w-4 mr-2" /> Force reset
              </Button>
            </Link>
            <Button variant="destructive" onClick={() => resetDemo()}>
              Reset demo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" /> About
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Mabe EV Charging Demo. 100% local. Next.js + Tailwind + shadcn/ui + Zustand.
          </CardContent>
        </Card>
      </div>
    </DriverShell>
  )
}
