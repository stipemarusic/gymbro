"use client"

import { useMemo, useState } from "react"

type ExerciseNameAutocompleteProps = {
  value: string
  onChange: (value: string) => void
  suggestions: readonly string[]
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export default function ExerciseNameAutocomplete({
  value,
  onChange,
  suggestions,
  placeholder,
  className,
  autoFocus,
}: ExerciseNameAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)

  const filteredSuggestions = useMemo(() => {
    const normalizedValue = value.trim().toLowerCase()

    return suggestions
      .filter((suggestion) => {
        const normalizedSuggestion = suggestion.toLowerCase()

        if (!normalizedValue) {
          return true
        }

        return (
          normalizedSuggestion.includes(normalizedValue) &&
          normalizedSuggestion !== normalizedValue
        )
      })
      .slice(0, 8)
  }, [suggestions, value])

  function selectSuggestion(suggestion: string) {
    onChange(suggestion)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <input
        autoFocus={autoFocus}
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onChange={(e) => {
          onChange(e.target.value)
          setIsOpen(true)
        }}
        className={
          className ||
          "w-full rounded-xl border border-white/10 bg-background/80 p-3 text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
        }
      />

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-white/10 bg-card shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                selectSuggestion(suggestion)
              }}
              className="block w-full px-3 py-2 text-left text-sm text-card-foreground transition hover:bg-secondary/15 hover:text-secondary"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
