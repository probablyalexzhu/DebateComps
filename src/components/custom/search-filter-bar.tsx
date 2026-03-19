"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
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

  const handleOnlineChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isOnline: value === "all" ? null : value === "online",
    })
  }

  const handleFormatChange = (value: string) => {
    onFiltersChange({
      ...filters,
      format: value === "all" ? null : value,
    })
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

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      category: value === "all" ? null : value,
    })
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

  const hasActiveFilters =
    filters.searchText !== "" ||
    filters.isOnline !== null ||
    filters.format !== null ||
    filters.teamCapMin !== 0 ||
    filters.teamCapMax !== 400 ||
    filters.oneDayOnly ||
    filters.category !== null ||
    filters.timezoneProximity !== 'any'

  return (
    <div className="space-y-4 mb-8">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by competition name or location..."
            value={filters.searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  !
                </span>
              )}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <div className="rounded-lg border bg-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filter Options</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear all
                </Button>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Event Type</Label>
                <RadioGroup
                  value={filters.isOnline === null ? "all" : filters.isOnline ? "online" : "in-person"}
                  onValueChange={handleOnlineChange}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="font-normal cursor-pointer">
                      All Events
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="font-normal cursor-pointer">
                      Online
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="in-person" id="in-person" />
                    <Label htmlFor="in-person" className="font-normal cursor-pointer">
                      In-Person
                    </Label>
                  </div>
                </RadioGroup>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="one-day"
                    checked={filters.oneDayOnly}
                    onCheckedChange={(checked) => handleOneDayChange(checked === true)}
                  />
                  <Label htmlFor="one-day" className="font-normal cursor-pointer">
                    One-day Only
                  </Label>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Format</Label>
                <RadioGroup value={filters.format || "all"} onValueChange={handleFormatChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="format-all" />
                    <Label htmlFor="format-all" className="font-normal cursor-pointer">
                      All Formats
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="BP" id="bp" />
                    <Label htmlFor="bp" className="font-normal cursor-pointer">
                      British Parliamentary
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="AP" id="ap" />
                    <Label htmlFor="ap" className="font-normal cursor-pointer">
                      Asian Parliamentary
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="OTHER" id="other" />
                    <Label htmlFor="other" className="font-normal cursor-pointer">
                      Other
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Category</Label>
                <RadioGroup value={filters.category || "all"} onValueChange={handleCategoryChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="category-all" />
                    <Label htmlFor="category-all" className="font-normal cursor-pointer">
                      All Categories
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="category-large" />
                    <Label htmlFor="category-large" className="font-normal cursor-pointer">
                      Large Tournament
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="premier" id="category-premier" />
                    <Label htmlFor="category-premier" className="font-normal cursor-pointer">
                      Premier Regional
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wudc" id="category-wudc" />
                    <Label htmlFor="category-wudc" className="font-normal cursor-pointer">
                      WUDC
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Team Cap: {filters.teamCapMin} - {filters.teamCapMax}
                </Label>
                <div className="pt-2">
                  <Slider
                    min={0}
                    max={400}
                    step={10}
                    value={[filters.teamCapMin, filters.teamCapMax]}
                    onValueChange={handleTeamCapChange}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>400</span>
                </div>

                <Label className="text-sm font-medium md:!mt-6">Timezone</Label>
                <div className="flex flex-wrap gap-2">
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
                        "px-3 py-1 text-sm rounded-full border transition-colors cursor-pointer",
                        filters.timezoneProximity === value
                          ? color || 'bg-foreground text-background border-foreground'
                          : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Relative to you ({(() => {
                  const offset = -new Date().getTimezoneOffset()
                  const sign = offset >= 0 ? '+' : '-'
                  const h = Math.floor(Math.abs(offset) / 60)
                  const m = Math.abs(offset) % 60
                  return `GMT${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`
                })()})</p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
