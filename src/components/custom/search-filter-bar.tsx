"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export interface FilterState {
  searchText: string
  isOnline: boolean | null
  format: string | null
  teamCapMin: number
  teamCapMax: number
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

  const handleClearFilters = () => {
    onFiltersChange({
      searchText: "",
      isOnline: null,
      format: null,
      teamCapMin: 0,
      teamCapMax: 200,
    })
    setIsOpen(false)
  }

  const hasActiveFilters =
    filters.searchText !== "" ||
    filters.isOnline !== null ||
    filters.format !== null ||
    filters.teamCapMin !== 0 ||
    filters.teamCapMax !== 200

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

            <div className="grid gap-6 md:grid-cols-3">
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
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Team Cap: {filters.teamCapMin} - {filters.teamCapMax}
                </Label>
                <div className="pt-2">
                  <Slider
                    min={0}
                    max={200}
                    step={10}
                    value={[filters.teamCapMin, filters.teamCapMax]}
                    onValueChange={handleTeamCapChange}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>200</span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
