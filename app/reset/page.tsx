"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ResetPage() {
  const router = useRouter()
  const [done, setDone] = useState(false)

  useEffect(() => {
    try {
      localStorage.removeItem("mabe-ev")
      setDone(true)
    } catch {}
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-sm w-full rounded-2xl border bg-background p-5 shadow-sm">
        <h1 className="text-lg font-semibold">Reset de datos locales</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {done ? "Datos de la demo limpiados de localStorage." : "Intentando limpiar datos…"}
        </p>
        <div className="mt-4 grid gap-2">
          <button className="h-11 rounded-lg bg-primary text-primary-foreground" onClick={() => router.push("/home")}>
            Volver a Inicio
          </button>
          <button
            className="h-11 rounded-lg border"
            onClick={() => {
              try {
                localStorage.removeItem("mabe-ev")
              } catch {}
              router.refresh()
            }}
          >
            Limpiar nuevamente
          </button>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">Si la app vuelve a fallar, abre directamente /reset</p>
      </div>
    </div>
  )
}
