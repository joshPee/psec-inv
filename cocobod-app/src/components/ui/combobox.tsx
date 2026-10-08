"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  name?: string
  required?: boolean
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  name,
  required,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredOptions = React.useMemo(() => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    )
  }, [options, search])

  const selectedOption = React.useMemo(() => {
    return options.find((option) => option.value === value)
  }, [options, value])

  return (
    <div ref={containerRef} className="relative w-full">
      <input type="hidden" name={name} value={value} required={required} />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100 dark:border-slate-700">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 px-2.5 text-xs sm:text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50 dark:divide-slate-700/50">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs sm:text-sm text-slate-400 dark:text-slate-500">
                No results found.
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onValueChange?.(option.value)
                    setOpen(false)
                    setSearch("")
                  }}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2 text-xs sm:text-sm text-left outline-none hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors",
                    value === option.value && "bg-slate-100 dark:bg-slate-700 font-medium text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {value === option.value && (
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </span>
                  <span className="truncate">{option.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
