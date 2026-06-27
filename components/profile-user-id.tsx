"use client"

import { useState } from "react"

export default function ProfileUserId({
  userId,
}: {
  userId: string
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  async function copyUserId() {
    await navigator.clipboard.writeText(userId)
    setCopied(true)

    window.setTimeout(() => {
      setCopied(false)
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <p className="font-mono text-sm">
        {isVisible ? userId : "••••••••••••••••"}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-black shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(6,182,212,0.42)] active:translate-y-px active:scale-100"
        >
          {isVisible ? "Hide" : "Show"}
        </button>

        <button
          type="button"
          onClick={copyUserId}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  )
}
