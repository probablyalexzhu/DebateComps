"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

export type TimezoneProximity = 'any' | 'same' | 'close' | 'far'

export interface FilterState {
  searchText: string
  isOnline: boolean | null
  format: string | null
  teamCapMin: number
  teamCapMax: number
  oneDayOnly: boolean
  category: string | null
  timezoneProximity: TimezoneProximity
}

interface SearchFilterBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export function SearchFilterBar({ filters, onFiltersChange }: SearchFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchText: value })
  }

  const handleTeamCapChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      teamCapMin: values[0],
      teamCapMax: values[1],
    })
  }

  const handleOneDayChange = (checked: boolean) => {
    onFiltersChange({ ...filters, oneDayOnly: checked })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      searchText: "",
      isOnline: null,
      format: null,
      teamCapMin: 0,
      teamCapMax: 400,
      oneDayOnly: false,
      category: null,
      timezoneProximity: 'any',
    })
    setIsOpen(false)
  }

  const activeFilterCount = [
    filters.isOnline !== null,
    filters.format !== null,
    filters.teamCapMin !== 0 || filters.teamCapMax !== 400,
    filters.oneDayOnly,
    filters.category !== null,
    filters.timezoneProximity !== 'any',
  ].filter(Boolean).length

  const categoryOptions = [
    { value: "large", label: "Large" },
    { value: "premier", label: "Premier Regional" },
    { value: "wudc", label: "WUDC" },
  ]

  const formatOptions = [
    { value: "BP", label: "BP" },
    { value: "AP", label: "AP" },
    { value: "OTHER", label: "Other" },
  ]

  const eventTypeOptions = [
    { value: "online", label: "Online" },
    { value: "in-person", label: "In-Person" },
  ]

  return (
    <div className="space-y-4 mb-8">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or location..."
            value={filters.searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-8 pl-9"
          />
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          {eventTypeOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => {
                const isOnlineValue = value === "online"
                onFiltersChange({
                  ...filters,
                  isOnline: filters.isOnline === isOnlineValue ? null : isOnlineValue,
                })
              }}
              className={cn(
                "h-8 px-3 text-sm rounded-full border transition-colors cursor-pointer whitespace-nowrap",
                (filters.isOnline === true && value === "online") || (filters.isOnline === false && value === "in-person")
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="hidden md:block w-px h-6 bg-border shrink-0" />

        <div className="hidden md:flex items-center gap-1.5">
          {formatOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onFiltersChange({ ...filters, format: filters.format === value ? null : value })}
              className={cn(
                "h-8 px-3 text-sm rounded-full border transition-colors cursor-pointer whitespace-nowrap",
                filters.format === value
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="h-8 gap-2 bg-transparent">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <div className="rounded-lg border bg-card p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm"><span className="sm:hidden">Filters</span><span className="hidden sm:inline">More Filters</span></h3>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-1.5 h-7 text-xs text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                  Clear all filters
                </Button>
              )}
            </div>

            {/* Mobile-only: show Event Type & Format here since inline pills are hidden */}
            <div className="sm:hidden flex flex-wrap items-center gap-x-3 gap-y-2">
              <Label className="text-sm font-medium mr-1">Event Type</Label>
              {eventTypeOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    const isOnlineValue = value === "online"
                    onFiltersChange({
                      ...filters,
                      isOnline: filters.isOnline === isOnlineValue ? null : isOnlineValue,
                    })
                  }}
                  className={cn(
                    "h-8 px-3 text-sm rounded-full border transition-colors cursor-pointer",
                    (filters.isOnline === true && value === "online") || (filters.isOnline === false && value === "in-person")
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="md:hidden flex flex-wrap items-center gap-x-3 gap-y-2">
              <Label className="text-sm font-medium mr-1">Format</Label>
              {formatOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onFiltersChange({ ...filters, format: filters.format === value ? null : value })}
                  className={cn(
                    "h-8 px-3 text-sm rounded-full border transition-colors cursor-pointer",
                    filters.format === value
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Label className="text-sm font-medium mr-1">Category</Label>
              {categoryOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onFiltersChange({ ...filters, category: filters.category === value ? null : value })}
                  className={cn(
                    "h-8 px-3 text-sm rounded-full border transition-colors cursor-pointer",
                    filters.category === value
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
                  )}
                >
                  {label}
                </button>
              ))}
              <div className="w-px h-5 bg-border shrink-0" />
              <button
                onClick={() => handleOneDayChange(!filters.oneDayOnly)}
                className={cn(
                  "h-8 px-3 text-sm rounded-full border transition-colors cursor-pointer",
                  filters.oneDayOnly
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
                )}
              >
                One-day Only
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Label className="text-sm font-medium mr-1">Timezone</Label>
              {([
                { value: 'any', label: 'Any', color: '' },
                { value: 'same', label: 'Same', color: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-700' },
                { value: 'close', label: '±1–3h', color: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-900/40 dark:text-sky-400 dark:border-sky-700' },
                { value: 'far', label: '±4–8h', color: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-700' },
              ] as const).map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => onFiltersChange({ ...filters, timezoneProximity: value })}
                  className={cn(
                    "h-8 px-3 text-sm rounded-full border transition-colors cursor-pointer",
                    filters.timezoneProximity === value
                      ? color || 'bg-foreground text-background border-foreground'
                      : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30'
                  )}
                >
                  {label}
                </button>
              ))}
              <span className="text-xs text-muted-foreground">Relative to you ({(() => {
                const offset = -new Date().getTimezoneOffset()
                const sign = offset >= 0 ? '+' : '-'
                const h = Math.floor(Math.abs(offset) / 60)
                const m = Math.abs(offset) % 60
                return `GMT${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`
              })()})</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Label className="text-sm font-medium mr-1">
                Team Cap: {filters.teamCapMin}–{filters.teamCapMax}
              </Label>
              <div className="w-48">
                <Slider
                  min={0}
                  max={400}
                  step={10}
                  value={[filters.teamCapMin, filters.teamCapMax]}
                  onValueChange={handleTeamCapChange}
                  className="w-full"
                />
              </div>
              <span className="text-xs text-muted-foreground">0–400</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
