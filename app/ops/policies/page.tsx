"use client"

import { AppShell } from "@/components/app-shell"
import { SitePolicyForm } from "@/components/site-policy-form"
import { useAppStore, hasOpsPermission } from "@/store/use-store"
import { Card, CardContent } from "@/components/ui/card"

export default function PoliciesPage() {
  const role = useAppStore((s) => s.ui.role)
  const canEdit = hasOpsPermission(role)

  return (
    <AppShell>
      <div className="p-4 space-y-3">
        {!canEdit && (
          <Card>
            <CardContent className="py-3 text-sm text-amber-600">
              Necesitas un rol operativo para editar las políticas (Operator, Site Manager, Admin-lite, Technician).
            </CardContent>
          </Card>
        )}
        <SitePolicyForm />
      </div>
    </AppShell>
  )
}
