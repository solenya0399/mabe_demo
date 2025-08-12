"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PanelsTopLeft, ActivitySquare, ListOrdered, Gauge, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/ops/board", label: "Board", icon: PanelsTopLeft },
  { href: "/ops/energy", label: "Energy", icon: ActivitySquare },
  { href: "/ops/queue", label: "Queue", icon: ListOrdered },
  { href: "/ops/costs", label: "Costs", icon: Gauge },
  { href: "/ops/policies", label: "Policies", icon: SlidersHorizontal },
]

export function OpsBottomNav() {
  const pathname = usePathname()
  return (
    <div className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="mx-auto max-w-md grid grid-cols-5">
        {items.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "py-2.5 flex flex-col items-center justify-center text-[11px]",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5 mb-0.5", active && "text-foreground")} />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
