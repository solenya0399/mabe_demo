export type Department = "Ops" | "Ingeniería" | "Ventas" | "Flota" | "Seguridad" | "Auditoría"

export interface User {
  id: string
  name: string
  department: Department
}
