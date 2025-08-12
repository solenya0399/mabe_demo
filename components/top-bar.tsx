"use client"
import { useAppStore } from "@/store/use-store"
import { MapPin, Search, LogOut, Zap, Activity, Users, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMemo } from "react"
import { useRouter } from "next/navigation"

export function TopBar() {
  const router = useRouter()
  const sites = useAppStore((s) => s.sites)
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const setSite = useAppStore((s) => s.setCurrentSite)
  const currentUser = useAppStore((s) => s.users.find((u) => u.id === s.ui.currentUserId))

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <div className="mx-auto max-w-md px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
          <MapPin className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <select
            className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300"
            value={siteId}
            onChange={(e) => setSite(e.target.value)}
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <Input
            placeholder="Buscar reservas, vehículos..."
            className="pl-10 h-9 rounded-full border-0 bg-slate-100 dark:bg-slate-800 focus:bg-background"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-slate-600 dark:text-slate-400">
          👋 Hola{" "}
          <span className="font-medium text-slate-900 dark:text-slate-100">{currentUser?.name?.split(" ")[0]}</span>
        </div>
        <KPIStrip />
      </div>
    </div>
  )
}

function KPIStrip() {
  const siteId = useAppStore((s) => s.ui.currentSiteId)
  const kpisFn = useAppStore((s) => s.kpisForSite)
  const k = useMemo(() => kpisFn(siteId), [kpisFn, siteId])

  return (
    <div className="flex items-center gap-3">
      <Badge
        variant="outline"
        className="text-[10px] px-2 py-0.5 bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
      >
        <Activity className="h-3 w-3 mr-1" />
        {k.active} activas
      </Badge>
      <Badge
        variant="outline"
        className="text-[10px] px-2 py-0.5 bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
      >
        <Users className="h-3 w-3 mr-1" />
        {k.today} hoy
      </Badge>
      <Badge
        variant="outline"
        className="text-[10px] px-2 py-0.5 bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/20 dark:border-slate-700 dark:text-slate-400"
      >
        <Zap className="h-3 w-3 mr-1" />
        {k.capKW} kW
      </Badge>
      <Badge
        variant="outline"
        className="text-[10px] px-2 py-0.5 bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
      >
        <TrendingUp className="h-3 w-3 mr-1" />
        {k.renewable}% renovable
      </Badge>
    </div>
  )
}
