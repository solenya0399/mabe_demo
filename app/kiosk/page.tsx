"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAppStore } from "@/store/use-store"
import { CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function KioskPage() {
  const { toast } = useToast()
  const [code, setCode] = useState("")
  const findByCode = useAppStore((s) => s.findReservationByCode)
  const startSession = useAppStore((s) => s.startSession)
  const endByCode = useAppStore((s) => s.endSessionByCode)
  return (
    <div className="p-4 space-y-3">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Kiosko: Check-in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Ingresa tu código" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button
            className="w-full h-12 rounded-xl"
            onClick={() => {
              const r = findByCode(code)
              if (r) {
                startSession(r.id)
                toast({ title: "Check-in exitoso", description: "Sesión iniciada." })
              } else {
                toast({ title: "Código inválido", description: "No encontramos tu reserva.", variant: "destructive" })
              }
            }}
          >
            Iniciar carga
          </Button>
        </CardContent>
      </Card>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Kiosko: Check-out</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Ingresa tu código" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl bg-transparent"
            onClick={() => {
              const ok = endByCode(code)
              if (ok) toast({ title: "Check-out exitoso", description: "Sesión finalizada." })
              else
                toast({
                  title: "Código inválido",
                  description: "No encontramos sesión activa.",
                  variant: "destructive",
                })
            }}
          >
            Finalizar carga
          </Button>
        </CardContent>
      </Card>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CheckCircle2 className="h-4 w-4" /> No requiere identidad. Uso interno.
      </div>
    </div>
  )
}
