
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FeatureTabsSection from "@/components/image_tabs";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <section className="px-4 py-18 md:px-8 md:py-20 lg:mb-10 lg:py-24">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 text-center md:flex-row md:items-start md:gap-16 md:text-left">
          <div className="flex-1">
            <h1 className="mb-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight lg:text-5xl xl:text-6xl">
              A better way to build your workout.
            </h1>
            <p className="mb-6 xl:mb-8 max-w-xl text-base md:text-lg leading-8 text-muted-foreground">
              Create your custom workout splits in seconds. Track progress and stay consistent in the gym.
            </p>
            <div>
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="mb-2 h-12 bg-secondary px-6 text-base font-medium text-secondary-foreground opacity-90 shadow-lg shadow-primary/25 transition hover:shadow-xl hover:shadow-primary/30 hover:opacity-100 active:scale-95 lg:text-lg lg:hover:scale-105"
                >
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Plan your workout for free.
              </p>
            </div>
          </div>

          <div className="relative flex min-h-72 flex-1 items-center justify-center overflow-visible md:min-h-110 lg:min-h-130">
            <div className="absolute pointer-events-none -right-2 -top-10 h-70 w-100 rounded-full bg-primary/20 blur-[100px] lg:right-60 lg:-top-10 lg:h-100" />
            <div className="absolute pointer-events-none -bottom-25 -right-10 h-100 w-100 rounded-full bg-secondary/20 blur-[100px]" />

            <Image
              src="/hero-images/pc.png"
              alt="GymBro dashboard preview on desktop"
              width={1200}
              height={800}
              className="absolute bottom-0 -right-28 w-120 max-w-none object-contain drop-shadow-[0_30px_80px_rgba(0,0,0,0.5)] xs:-right-23 s:-right-18 sm:-right-13 sm:w-140 md:-right-35 md:top-0 md:w-150 lg:-right-40 lg:-top-24 lg:w-185 xl:-right-45 xl:-top-28 xl:w-220"
              priority
            />

            <Image
              src="/hero-images/phone.png"
              alt="GymBro mobile workout preview"
              width={500}
              height={320}
              className="absolute hidden object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)] lg:bottom-24 lg:right-48 lg:block xl:bottom-22 xl:right-65"
              priority
            />
          </div>
        </div>
      </section>
      <FeatureTabsSection />
    </main>
  );
}
