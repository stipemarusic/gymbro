import { getSession } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import AppSidebar from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  const session = await getSession()

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar
          user={{
            name: session.user?.name || null,
            email: session.user?.email || null,
            image: session.user &&
              "image" in session.user &&
              typeof session.user.image === "string"
              ? session.user.image
              : null,
          }}
        />

        <SidebarInset>
          <header className="flex h-14 items-center border-b border-border px-4 md:px-6">
            <SidebarTrigger />
          </header>

          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
