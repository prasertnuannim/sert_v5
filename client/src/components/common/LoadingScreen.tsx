import { Spinner } from '@/components/ui/spinner'

export function LoadingScreen() {
  return (
    <main
      className="text-muted-foreground grid min-h-svh place-content-center justify-items-center gap-3"
      aria-live="polite"
    >
      <Spinner className="size-7" />
      <p className="text-sm">กำลังตรวจสอบเซสชัน…</p>
    </main>
  )
}
