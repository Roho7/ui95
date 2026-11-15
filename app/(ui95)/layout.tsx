import { CrtSite } from "@/app/_site/CrtSite"

export default function Ui95Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <CrtSite />
    </>
  )
}
