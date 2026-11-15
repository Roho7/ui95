import { HardwareShell } from "@/components/chrome/hardware/HardwareShell"

export default function HardwareLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <HardwareShell>{children}</HardwareShell>
}
