"use client"

import { DriverShell } from "@/components/driver-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuickBookInline } from "@/components/quick-book-inline"
import { BookingWizard } from "@/components/booking-wizard"

export default function ReservePage() {
  return (
    <DriverShell>
      <div className="p-4 space-y-3">
        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="quick">Quick</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          <TabsContent value="quick">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quick reservation</CardTitle>
              </CardHeader>
              <CardContent>
                <QuickBookInline />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="advanced">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Advanced reservation</CardTitle>
              </CardHeader>
              <CardContent>
                <BookingWizard />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DriverShell>
  )
}
