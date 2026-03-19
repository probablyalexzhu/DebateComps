'use client'

import { Button } from "@/components/ui/button"
import { Grid3x3, Calendar, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

type ViewMode = 'grid' | 'calendar'

interface ViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function ViewToggle({ viewMode, onViewModeChange, onRefresh, isRefreshing }: ViewToggleProps) {
  return (
    <div className="flex items-center justify-between gap-2 mb-6 border-b">
      <div className="flex gap-2">
        <button
          onClick={() => onViewModeChange('grid')}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer",
            viewMode === 'grid'
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-4 w-4" />
            Grid View
          </div>
        </button>
        <button
          onClick={() => onViewModeChange('calendar')}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer",
            viewMode === 'calendar'
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar View
          </div>
        </button>
      </div>
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
      )}
    </div>
  )
}
