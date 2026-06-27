"use client";

import { Dumbbell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

export default function Navbar() {
    const pathname = usePathname();
    const isPublicRoute = pathname === "/" || pathname === "/sign-in" || pathname === "/sign-up";

    if (!isPublicRoute) {
        return null;
    }

    return (
        <nav className="border-b border-border bg-card/90 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-foreground transition hover:text-secondary">
                    <Dumbbell className="h-6 w-6 shrink-0 text-secondary" />
                    GymBro
                </Link>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Button asChild variant="ghost" className="h-10 px-3 text-foreground hover:text-secondary sm:px-5">
                        <Link href="/sign-in">Log In</Link>
                    </Button>

                    <Link
                        href="/sign-up"
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-secondary px-3 text-sm font-semibold text-black shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300 hover:scale-105 hover:bg-secondary hover:shadow-[0_0_28px_rgba(6,182,212,0.42)] active:translate-y-px active:scale-100 sm:px-5"
                    >
                        Get started
                    </Link>
                </div>
            </div>
        </nav>
    )
}
