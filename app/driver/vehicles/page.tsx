"use client"

import { DriverShell } from "@/components/driver-shell"
import { useMemo, useState } from "react"
import { useAppStore } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, Edit2, Plus, Trash2, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { VehicleForm } from "@/components/vehicle-form"
import type { Vehicle } from "@/types/vehicle"

export default function VehiclesPage() {
  const currentUserId = useAppStore((s) => s.ui.currentUserId)
  const vehiclesAll = useAppStore((s) => s.vehicles)
  const myVehicles = useMemo(
    () => vehiclesAll.filter((v) => v.ownerUserId === currentUserId),
    [vehiclesAll, currentUserId],
  )

  const addVehicle = useAppStore((s) => s.addVehicle)
  const updateVehicle = useAppStore((s) => s.updateVehicle)
  const removeVehicle = useAppStore((s) => s.removeVehicle)
  const currentVehicleId = useAppStore((s) => s.ui.currentVehicleId)
  const setCurrentVehicle = useAppStore((s) => s.setCurrentVehicle)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Vehicle | null>(null)

  return (
    <DriverShell>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Mis Vehículos</div>
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o)
              if (!o) setEditing(null)
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> Agregar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Editar vehículo" : "Agregar vehículo"}</DialogTitle>
              </DialogHeader>
              <VehicleForm
                mode={editing ? "edit" : "create"}
                initial={editing ?? undefined}
                onCancel={() => setOpen(false)}
                onSubmit={(data) => {
                  if (editing) {
                    updateVehicle(editing.id, data)
                  } else {
                    addVehicle(data)
                  }
                  setOpen(false)
                  setEditing(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-2">
          {myVehicles.length === 0 ? (
            <Card>
              <CardContent className="py-4 text-sm text-muted-foreground">
                No tienes vehículos registrados. Presiona "Agregar" para crear uno.
              </CardContent>
            </Card>
          ) : (
            myVehicles.map((v) => (
              <Card key={v.id} className="rounded-xl">
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>
                      {v.make} {v.model} {v.nickname ? `· ${v.nickname}` : ""}
                    </span>
                    <Badge variant={v.id === currentVehicleId ? "default" : "outline"}>
                      {v.id === currentVehicleId ? "Actual" : v.connectorType}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Car className="h-4 w-4" />
                    <span>
                      {v.connectorType} · {v.batteryKWh} kWh · típico {v.typicalChargeKW} kW
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(v)
                        setOpen(true)
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentVehicle(v.id)}
                      disabled={v.id === currentVehicleId}
                    >
                      <Check className="h-4 w-4 mr-2" /> Usar
                    </Button>
                    <Button size="sm" variant="destructive" className="ml-auto" onClick={() => removeVehicle(v.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DriverShell>
  )
}
