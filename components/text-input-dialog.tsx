"use client"

import { useState } from "react"
import ExerciseNameAutocomplete from "@/components/exercise-name-autocomplete"

type TextInputDialogProps = {
  open: boolean
  title: string
  description: string
  label: string
  placeholder?: string
  suggestions?: readonly string[]
  selectLabel?: string
  selectOptions?: string[]
  defaultSelectValue?: string
  confirmLabel: string
  cancelLabel?: string
  onCancel: () => void
  onConfirm: (value: string, selectValue?: string) => void
}

export default function TextInputDialog({
  open,
  title,
  description,
  label,
  placeholder,
  suggestions = [],
  selectLabel,
  selectOptions = [],
  defaultSelectValue,
  confirmLabel,
  cancelLabel = "Cancel",
  onCancel,
  onConfirm,
}: TextInputDialogProps) {
  const [value, setValue] = useState("")
  const [selectValue, setSelectValue] = useState(
    defaultSelectValue || selectOptions[0] || ""
  )

  if (!open) {
    return null
  }

  function handleCancel() {
    setValue("")
    setSelectValue(defaultSelectValue || selectOptions[0] || "")
    onCancel()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmedValue = value.trim()

    if (!trimmedValue) {
      return
    }

    setValue("")
    setSelectValue(defaultSelectValue || selectOptions[0] || "")
    onConfirm(trimmedValue, selectValue)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-card p-6 text-card-foreground shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
      >
        <h2 className="text-2xl font-bold">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>

        <div className="mt-6">
          <label className="mb-2 block font-medium">
            {label}
          </label>

          {suggestions.length > 0 ? (
            <ExerciseNameAutocomplete
              autoFocus
              value={value}
              placeholder={placeholder}
              onChange={setValue}
              suggestions={suggestions}
            />
          ) : (
            <input
              autoFocus
              value={value}
              placeholder={placeholder}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-background/80 p-3 text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            />
          )}
        </div>

        {selectOptions.length > 0 && (
          <div className="mt-4">
            <label className="mb-2 block font-medium">
              {selectLabel}
            </label>

            <select
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-background/80 p-3 text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            >
              {selectOptions.map((option) => (
                <option key={option} value={option} className="bg-background text-foreground">
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-xl border border-white/10 px-5 py-3 font-semibold transition hover:bg-white/10"
          >
            {cancelLabel}
          </button>

          <button
            type="submit"
            disabled={!value.trim()}
            className="rounded-xl bg-secondary px-5 py-3 font-semibold text-black shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(6,182,212,0.42)] active:translate-y-px active:scale-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
