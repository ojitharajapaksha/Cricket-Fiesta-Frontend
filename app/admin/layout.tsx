import { ResponsiveLayout } from "@/components/app-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ResponsiveLayout>
      {children}
    </ResponsiveLayout>
  )
}
