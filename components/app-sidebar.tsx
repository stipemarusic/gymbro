"use client"

import {
  Home,
  Dumbbell,
  History,
  TrendingUp,
  User,
  Trophy,
  Plus,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "./ui/sidebar"

import { Button } from "./ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth/auth-client"

type SidebarUser = {
  name: string | null
  email: string | null
  image: string | null
}

const menu_items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Workouts",
    url: "/dashboard/workouts",
    icon: Dumbbell,
  },
  {
    title: "History",
    url: "/dashboard/history",
    icon: History,
  },
  {
    title: "Progress",
    url: "/dashboard/progress",
    icon: TrendingUp,
  },
  {
    title: "Records",
    url: "/dashboard/records",
    icon: Trophy,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
]

function getInitials(name: string | null, email: string | null) {
  if (name) {
    const initials = name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")

    return initials.toUpperCase()
  }

  return (email?.[0] || "U").toUpperCase()
}

export default function AppSidebar({
  user,
}: {
  user?: SidebarUser
}) {
  const { state, isMobile } = useSidebar()

  const collapsed = state === "collapsed"
  const iconOnly = collapsed && !isMobile
  const showText = !iconOnly

  const buttonClass = iconOnly
    ? "h-14 w-14 mx-auto rounded-2xl justify-center"
    : "h-12 rounded-xl"

  const router = useRouter()

  async function handleLogout() {
    await signOut()

    router.push("/")
  }

  const displayName = user?.name || user?.email || "User"
  const initials = getInitials(user?.name || null, user?.email || null)

  return (
    <Sidebar collapsible="icon" className="transition-all duration-300 ease-in-out">
      <SidebarHeader>
        <div className={`px-5 ${iconOnly ? "py-8" : "py-6"}`}>
          <div className={`flex items-center ${iconOnly ? "justify-center" : "gap-3"}`}>
            <div className="flex p-3 h-14 w-14 items-center justify-center rounded-2xl bg-secondary shadow-lg">
              <Dumbbell className="h-7 w-7 text-black" />
            </div>

            {showText && (
              <div>
                <h2 className="font-bold text-lg">
                  GymBro
                </h2>

                <p className="text-xs text-muted-foreground">
                  Fitness Tracker
                </p>
              </div>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className={`${iconOnly ? "space-y-3 px-0" : "space-y-3 px-2"}`}>
          {menu_items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`
                    ${buttonClass}
                    justify-center
                    h-12
                    rounded-xl
                    transition-all
                    duration-300
                    hover:bg-secondary/15
                    hover:text-secondary
                    hover:translate-x-1
                    hover:scale-1.03
                    hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]
                `}
              >
                <a
                    href={item.url}
                    className={`flex w-full items-center ${
                        iconOnly
                        ? "justify-center"
                        : "gap-3"
                    }`}
                >
                    <item.icon
                        className={
                        iconOnly
                            ? "size-6 shrink-0"
                            : "size-5 shrink-0"
                        }
                    />

                    {showText && (
                        <span>{item.title}</span>
                    )}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className={`pt-6 ${iconOnly ? "px-0 flex justify-center" : "px-3"}`}>
            <Button
                onClick={() => router.push("/dashboard/workouts/new")}
                className={`
                    ${
                    iconOnly
                        ? "h-14 w-14 rounded-2xl p-0"
                        : "w-full h-12 rounded-xl"
                    }
                    bg-secondary
                    text-black
                    font-semibold
                    transition-all
                    duration-300
                    hover:brightness-110
                    hover:scale-105
                    hover:shadow-[0_0_25px_rgba(6,182,212,0.35)]
                `}
            >
                {iconOnly ? <Plus size={24} /> : "+ New Workout"}
            </Button>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <div className="border-t border-white/5 p-4">
          <div className={`flex items-center ${iconOnly ? "justify-center" : "gap-3"}`}>
            <Link
              href="/dashboard/profile"
              className={`flex min-w-0 items-center rounded-xl transition hover:bg-secondary/10 ${
                iconOnly ? "justify-center" : "gap-3 p-2"
              }`}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary bg-cover bg-center text-black font-bold shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                style={
                  user?.image
                    ? {
                        backgroundImage: `url(${user.image})`,
                      }
                    : undefined
                }
              >
                {!user?.image && initials}
              </div>

              {showText && (
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {displayName}
                  </p>

                  {user?.email && (
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              )}
            </Link>

            {showText && (
              <Button variant="destructive" onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 transition">Sign Out</Button>
            )}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
