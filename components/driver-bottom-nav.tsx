"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home, Map, Car, CalendarClock } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/driver/home", label: "Inicio", icon: Home },
  { href: "/driver/reserve", label: "Reservar", icon: CalendarClock },
  { href: "/driver/schedule", label: "Agenda", icon: Calendar },
  { href: "/driver/map", label: "Mapa", icon: Map },
  { href: "/driver/garage", label: "Garaje", icon: Car },
]

export function DriverBottomNav() {
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
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
              <Icon
                className={cn("h-5 w-5 mb-1 transition-all duration-200", active && "text-primary transform scale-110")}
              />
              <span className={cn("truncate transition-all duration-200", active && "font-medium")}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
