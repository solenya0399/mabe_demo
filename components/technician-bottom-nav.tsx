"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Wrench, AlertTriangle, Settings, FileText, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/technician", label: "Panel", icon: Wrench },
  { href: "/technician/tickets", label: "Tickets", icon: AlertTriangle },
  { href: "/technician/maintenance", label: "Mantenimiento", icon: Settings },
  { href: "/technician/reports", label: "Reportes", icon: FileText },
  { href: "/technician/schedule", label: "Agenda", icon: Calendar },
]

export function TechnicianBottomNav() {
  const pathname = usePathname()
  return (
    <div className="bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 border-t border-border/50 shadow-lg">
      <div className="mx-auto max-w-md grid grid-cols-5">
        {items.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "py-3 flex flex-col items-center justify-center text-[11px] transition-all duration-200 relative",
                active ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-orange-600 dark:bg-orange-400 rounded-full" />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 mb-1 transition-all duration-200",
                  active && "text-orange-600 dark:text-orange-400 transform scale-110",
                )}
              />
              <span className={cn("truncate transition-all duration-200", active && "font-medium")}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
