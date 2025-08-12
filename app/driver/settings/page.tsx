"use client"

import { AppShell } from "@/components/app-shell"
import { useAppStore } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { SunMoon, Settings, Car, MapPin, Users } from "lucide-react"
import Link from "next/link"

const SettingsPage = () => {
  const theme = useAppStore((s) => s.ui.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const role = useAppStore((s) => s.ui.role)
  const setRole = useAppStore((s) => s.setRole)
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const setSiteId = useAppStore((s) => s.setCurrentSite)
  const sites = useAppStore((s) => s.sites)
  const users = useAppStore((s) => s.users)
  const currentUserId = useAppStore((s) => s.ui.currentUserId)
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)

  return (
    <AppShell>
      <div className="p-4 space-y-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" /> Preferencias
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid grid-cols-2 items-center gap-2">
              <Label>Tema</Label>
              <div className="justify-self-end">
                <Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  <SunMoon className="h-4 w-4 mr-2" /> {theme === "dark" ? "Claro" : "Oscuro"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 items-center gap-2">
              <Label>Rol</Label>
              <div className="justify-self-end">
                <select
                  className="bg-muted px-3 py-2 rounded-lg text-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                >
                  {[
                    "Driver",
                    "Operator",
                    "Site Manager",
                    "Admin-lite",
                    "Technician",
                    "Finance",
                    "Security",
                    "Auditor",
                    "Guest",
                  ].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 items-center gap-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Sitio
              </Label>
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

            <div className="grid grid-cols-2 items-center gap-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Usuario demo
              </Label>
              <div className="justify-self-end">
                <select
                  className="bg-muted px-3 py-2 rounded-lg text-sm"
                  value={currentUserId}
                  onChange={(e) => setCurrentUser(e.target.value)}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
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
              <Car className="h-4 w-4" /> Gestión
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Link href="/vehicles">
              <Button variant="outline">Vehículos</Button>
            </Link>
            <Link href="/book">
              <Button variant="outline">Reserva avanzada</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}

export default SettingsPage
