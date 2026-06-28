"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, useSession } from "@/lib/auth/auth-client";
import { queueFeedback } from "@/lib/feedback";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function SignIn() {
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const  { data: session } = useSession();
    
        useEffect(() => {
            if (session) {
                router.push("/dashboard")
            }
        }, [session, router]);

    async function handlesubmit(e: React.FormEvent) {
        e.preventDefault();

        setError("")
        setLoading(true);

        try {
            const result = await signIn.email({
                email,
                password,
            });

            if(result.error){
                setError(result.error.message ?? "Failed to sign in")
            } else {
                queueFeedback({
                    title: "Welcome back",
                    description: "You signed in successfully.",
                    variant: "success",
                })
                router.push("/dashboard");
            }
        } catch {
            setError("An unexpected error has occurred")
        } finally{
            setLoading(false);
        }
    }
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <Card className="w-full max-w-md border border-white/10 bg-card/90 text-card-foreground shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">
                        Sign in
                    </CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handlesubmit} className="space-y-4">
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 border-white/10 bg-input text-foreground caret-secondary shadow-sm shadow-black/20 [color-scheme:dark] placeholder:text-muted-foreground focus:bg-input focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:ring-offset-0" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} className="h-10 border-white/10 bg-input text-foreground caret-secondary shadow-sm shadow-black/20 [color-scheme:dark] placeholder:text-muted-foreground focus:bg-input focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:ring-offset-0" required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col space-y-2">
                        <Button className="h-10 w-full bg-secondary font-semibold text-black shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300 hover:scale-[1.02] hover:bg-secondary hover:shadow-[0_0_28px_rgba(6,182,212,0.42)] active:translate-y-px active:scale-100 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
                        <p className="text-center text-sm text-muted-foreground">Don&apos;t have an account?{" "} <Link className="font-medium text-secondary hover:underline" href="/sign-up">Sign up</Link></p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
