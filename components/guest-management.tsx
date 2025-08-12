"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/store/use-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserPlus, Users, Car, Phone, Mail, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function GuestManagement() {
  const { toast } = useToast()
  const currentUserId = useAppStore((s) => s.ui.currentUserId)
  const role = useAppStore((s) => s.ui.role)
  const guests = useAppStore((s) => s.guests?.filter((g) => g.hostUserId === currentUserId) || [])
  const addGuest = useAppStore((s) => s.addGuest)
  const canHostGuests = useAppStore((s) => s.canUserHostGuests)

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    licensePlate: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleColor: "",
  })

  const monthlyGuestReservations = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    return guests.reduce((total, guest) => {
      // Aquí contaríamos las reservas del mes actual
      return total + (guest.monthlyReservations || 0)
    }, 0)
  }, [guests])

  const handleSubmit = () => {
    if (!formData.name || !formData.licensePlate || !formData.vehicleMake) {
      toast({
        title: "Campos requeridos",
        description: "Completa nombre, placa y marca del vehículo",
        variant: "destructive",
      })
      return
    }

    const guestId = addGuest({
      ...formData,
      hostUserId: currentUserId,
    })

    toast({
      title: "Invitado agregado",
      description: `${formData.name} ha sido registrado exitosamente`,
    })

    setFormData({
      name: "",
      email: "",
      phone: "",
      licensePlate: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleColor: "",
    })
    setOpen(false)
  }

  if (!canHostGuests(currentUserId)) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <div className="text-slate-600 dark:text-slate-400">Función no disponible</div>
          <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">
            Necesitas rol de anfitrión para gestionar invitados
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Gestión de Invitados</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {guests.length} invitados registrados • {monthlyGuestReservations} reservas este mes
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Invitado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Invitado</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre completo *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="555-1234"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Placa del vehículo *</Label>
                <Input
                  value={formData.licensePlate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                  placeholder="ABC-123"
                  maxLength={8}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Marca *</Label>
                  <Input
                    value={formData.vehicleMake}
                    onChange={(e) => setFormData((prev) => ({ ...prev, vehicleMake: e.target.value }))}
                    placeholder="Toyota"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData((prev) => ({ ...prev, vehicleModel: e.target.value }))}
                    placeholder="Prius"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  value={formData.vehicleColor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vehicleColor: e.target.value }))}
                  placeholder="Blanco"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                Registrar Invitado
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de invitados */}
      <div className="space-y-3">
        {guests.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="py-8 text-center">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <div className="text-slate-600 dark:text-slate-400">No tienes invitados registrados</div>
              <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                Agrega invitados para poder hacer reservas en su nombre
              </div>
            </CardContent>
          </Card>
        ) : (
          guests.map((guest) => (
            <Card key={guest.id} className="rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-white dark:text-slate-900" />
                    </div>
                    <div>
                      <div className="font-medium">{guest.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {guest.vehicleMake} {guest.vehicleModel} • {guest.licensePlate}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{guest.monthlyReservations || 0} reservas este mes</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {guest.email && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Mail className="h-3 w-3" />
                      <span>{guest.email}</span>
                    </div>
                  )}
                  {guest.phone && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone className="h-3 w-3" />
                      <span>{guest.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Car className="h-3 w-3" />
                    <span>{guest.vehicleColor || "Color no especificado"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="h-3 w-3" />
                    <span>Registrado {new Date(guest.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
