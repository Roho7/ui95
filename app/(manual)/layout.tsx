import { ManualShell } from "@/components/chrome/manual/ManualShell"

export default function ManualLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ManualShell>{children}</ManualShell>
}
