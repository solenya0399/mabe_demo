export interface VehicleDocument {
  id: string
  vehicleId: string
  type: "registration" | "insurance" | "license"
  url: string
  verified: boolean
  uploadedAt: string
}
