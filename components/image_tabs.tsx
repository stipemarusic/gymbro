"use client";

import { useState } from "react";
import Image from "next/image";
import { Dumbbell, TrendingUp, BarChart3 } from "lucide-react";

const tabs = [
  {
    id: "workout",
    title: "Build Split Plans",
    description: "Create custom workout structures for every training day.",
    image: "/features/workout.png",
    icon: Dumbbell,
  },
  {
    id: "progress",
    title: "Track Progress",
    description: "Measure consistency, performance and long-term improvements.",
    image: "/features/progress.png",
    icon: TrendingUp,
  },
  {
    id: "stats",
    title: "Statistics Dashboard",
    description: "Visualize sets, volume and training trends with simple charts.",
    image: "/features/stats.png",
    icon: BarChart3,
  },
];

export default function FeatureTabsSection() {
  const [activeTab, setActiveTab] = useState("workout");

  const activeFeature = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <section className="-mt-14 px-4 py-12 md:-mt-20 md:py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* TOP CLICKABLE CARDS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative overflow-hidden rounded-3xl border p-6 text-left transition-all duration-300 ${
                  isActive
                    ? "border-secondary bg-secondary/10 shadow-[0_0_0_1px_rgba(79,70,229,0.35),0_20px_60px_rgba(0,0,0,0.35)]"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                }`}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/20 ring-1 ring-white/10">
                  <Icon className="h-6 w-6 text-secondary" />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-white">
                  {tab.title}
                </h3>

                <p className="text-sm leading-6 text-white/65">
                  {tab.description}
                </p>

                {isActive && (
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.14),transparent_55%)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* BOTTOM IMAGE PREVIEW */}
        <div className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1020]/80 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <div className="relative h-55 w-full sm:h-80 md:h-105 lg:h-130">
            <Image
              key={activeFeature.image}
              src={activeFeature.image}
              alt={activeFeature.title}
              fill
              sizes="(min-width: 1024px) 1152px, calc(100vw - 32px)"
              className="rounded-2xl object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
