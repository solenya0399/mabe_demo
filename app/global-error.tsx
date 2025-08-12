"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-sm w-full rounded-2xl border bg-background p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Ha ocurrido un error</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Parece que la aplicación entró en un estado inválido. Puedes intentar reintentar o limpiar los datos
              locales.
            </p>
            <div className="mt-4 grid gap-2">
              <button className="h-10 rounded-lg bg-primary text-primary-foreground" onClick={() => reset()}>
                Reintentar
              </button>
              <button
                className="h-10 rounded-lg border"
                onClick={() => {
                  try {
                    localStorage.removeItem("mabe-ev")
                  } catch {}
                  location.reload()
                }}
              >
                Limpiar datos locales y recargar
              </button>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              {error?.message ? `Detalle: ${error.message}` : "Detalle no disponible."}
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
