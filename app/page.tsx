"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAppStore } from "@/store/use-store"
import { MapPin, Users, UserCog, Wrench, Car, Building2, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

const roles = [
  { id: "Driver", label: "Conductor", icon: Car, desc: "Reservar y gestionar cargas" },
  { id: "Operator", label: "Operador", icon: UserCog, desc: "Supervisar operaciones diarias" },
  { id: "Site Manager", label: "Gerente", icon: Building2, desc: "Gestión completa del sitio" },
  { id: "Technician", label: "Técnico", icon: Wrench, desc: "Mantenimiento y reparaciones" },
  { id: "Guest", label: "Invitado", icon: Users, desc: "Acceso limitado de consulta" },
] as const

export default function RoleGate() {
  const router = useRouter()
  const sites = useAppStore((s) => s.sites)
  const users = useAppStore((s) => s.users)
  const [role, setRole] = useState<(typeof roles)[number]["id"]>("Driver")
  const [siteId, setSiteId] = useState(sites[0]?.id ?? "")
  const [userId, setUserId] = useState(users[0]?.id ?? "")
  const setStoreRole = useAppStore((s) => s.setRole)
  const setSite = useAppStore((s) => s.setCurrentSite)
  const setUser = useAppStore((s) => s.setCurrentUser)

  const selectedRole = roles.find((r) => r.id === role)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-900 dark:bg-slate-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-white dark:text-slate-900" />
            </div>
            <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">Mabe EV Charging</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">Sistema de gestión de carga eléctrica</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Selecciona tu rol</Label>
              <div className="space-y-2">
                {roles.map((r) => {
                  const Icon = r.icon
                  const active = role === r.id
                  return (
                    <button
                      key={r.id}
                      className={`
                        w-full rounded-lg p-4 text-left transition-all duration-200 border
                        ${
                          active
                            ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                            : "bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border-slate-200 dark:border-slate-600"
                        }
                      `}
                      onClick={() => setRole(r.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{r.label}</div>
                          <div
                            className={`text-xs ${active ? "text-slate-300 dark:text-slate-600" : "text-slate-500 dark:text-slate-400"}`}
                          >
                            {r.desc}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Sitio de trabajo
              </Label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-3 rounded-lg text-sm focus:border-slate-900 dark:focus:border-slate-100 focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-slate-100/20"
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

            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuario demo
              </Label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-3 rounded-lg text-sm focus:border-slate-900 dark:focus:border-slate-100 focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-slate-100/20"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} - {u.department}
                  </option>
                ))}
              </select>
            </div>

            <Button
              className="w-full h-12 rounded-lg font-medium bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900"
              onClick={() => {
                setStoreRole(role as any)
                setSite(siteId)
                setUser(userId)
                if (role === "Technician") {
                  router.push("/technician")
                } else if (["Operator", "Site Manager", "Admin-lite"].includes(role as string)) {
                  router.push("/ops")
                } else {
                  router.push("/driver/home")
                }
              }}
            >
              Ingresar como {selectedRole?.label}
            </Button>

            <div className="text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400">🚀 Demo 100% local • Datos simulados</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Puedes cambiar de rol regresando a esta pantalla
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
