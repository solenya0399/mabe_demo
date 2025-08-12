"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Vehicle } from "@/types/vehicle"

type Props = {
  mode: "create" | "edit"
  initial?: Partial<Vehicle>
  onSubmit: (data: {
    make: string
    model: string
    connectorType: Vehicle["connectorType"]
    batteryKWh: number
    typicalChargeKW: number
    nickname?: string
  }) => void
  onCancel?: () => void
}

export function VehicleForm({ mode, initial, onSubmit, onCancel }: Props) {
  const [make, setMake] = useState(initial?.make ?? "")
  const [model, setModel] = useState(initial?.model ?? "")
  const [connectorType, setConnectorType] = useState<Vehicle["connectorType"]>(initial?.connectorType ?? "Type2")
  const [batteryKWh, setBattery] = useState<number>(initial?.batteryKWh ?? 60)
  const [typicalChargeKW, setTypical] = useState<number>(initial?.typicalChargeKW ?? 11)
  const [nickname, setNickname] = useState(initial?.nickname ?? "")

  useEffect(() => {
    if (initial) {
      setMake(initial.make ?? "")
      setModel(initial.model ?? "")
      setConnectorType((initial.connectorType as any) ?? "Type2")
      setBattery(initial.batteryKWh ?? 60)
      setTypical(initial.typicalChargeKW ?? 11)
      setNickname(initial.nickname ?? "")
    }
  }, [initial])

  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <Label>Marca</Label>
        <Input value={make} onChange={(e) => setMake(e.target.value)} placeholder="Ej. Nissan" />
      </div>
      <div className="grid gap-1">
        <Label>Modelo</Label>
        <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ej. Leaf" />
      </div>
      <div className="grid gap-1">
        <Label>Conector</Label>
        <Select value={connectorType} onValueChange={(v) => setConnectorType(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de conector" />
          </SelectTrigger>
          <SelectContent>
            {["CCS1", "Type2", "NACS"].map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-1">
          <Label>Capacidad (kWh)</Label>
          <Input
            type="number"
            min={20}
            max={120}
            value={batteryKWh}
            onChange={(e) => setBattery(Number.parseFloat(e.target.value || "60"))}
          />
        </div>
        <div className="grid gap-1">
          <Label>Carga típica (kW)</Label>
          <Input
            type="number"
            min={3}
            max={350}
            value={typicalChargeKW}
            onChange={(e) => setTypical(Number.parseFloat(e.target.value || "11"))}
          />
        </div>
      </div>
      <div className="grid gap-1">
        <Label>Alias (opcional)</Label>
        <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Ej. Oficina" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button
          onClick={() =>
            onSubmit({
              make: make.trim(),
              model: model.trim(),
              connectorType,
              batteryKWh,
              typicalChargeKW,
              nickname: nickname.trim() || undefined,
            })
          }
          disabled={!make.trim() || !model.trim()}
        >
          {mode === "create" ? "Añadir" : "Guardar"}
        </Button>
      </div>
    </div>
  )
}
