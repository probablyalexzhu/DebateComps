'use client'

import { ArrowUpRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { LinkEntry } from "@/lib/sheets"

interface LinkButtonProps {
  links: LinkEntry[]
  fallbackUrl: string
  label: string
  tbaLabel: string
  variant: "default" | "outline"
  popoverTitle: string
}

export function LinkButton({
  links,
  fallbackUrl,
  label,
  tbaLabel,
  variant,
  popoverTitle,
}: LinkButtonProps) {
  const cleanLinks = links.filter(l => l.url && l.url.trim() !== "" && l.url !== "TBA")
  const hasLinks = cleanLinks.length > 0
  const hasFallback = fallbackUrl && fallbackUrl !== "TBA" && fallbackUrl.trim() !== ""

  if (!hasLinks && !hasFallback) {
    return (
      <Button
        variant={variant}
        size="sm"
        className="flex-1 opacity-50 cursor-not-allowed"
        disabled
      >
        {tbaLabel}
      </Button>
    )
  }

  if (cleanLinks.length <= 1) {
    const href = cleanLinks[0]?.url ?? fallbackUrl
    return (
      <Button asChild variant={variant} size="sm" className="flex-1">
        <a href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      </Button>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className="group/trigger flex-1"
          aria-label={`${label} — ${cleanLinks.length} options`}
        >
          {label}
          <ChevronDown
            className="h-3.5 w-3.5 ml-0.5 opacity-70 transition-transform duration-200 group-data-[state=open]/trigger:rotate-180"
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-1">
        <div className="px-2.5 pt-2 pb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {popoverTitle}
        </div>
        <div className="flex flex-col">
          {cleanLinks.map((link, i) => (
            <LinkRow key={`${link.url}-${i}`} entry={link} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function LinkRow({ entry }: { entry: LinkEntry }) {
  const display = displayUrl(entry.url)
  const labelText = entry.label?.trim() || display
  const subtext = entry.label && entry.label.trim() ? display : null

  return (
    <a
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 px-2.5 py-2 rounded-sm hover:bg-muted focus-visible:bg-muted outline-none transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-tight truncate">
          {labelText}
        </div>
        {subtext && (
          <div className="text-xs text-muted-foreground leading-tight truncate mt-0.5 font-mono">
            {subtext}
          </div>
        )}
      </div>
      <ArrowUpRight
        className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground transition-all group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden
      />
    </a>
  )
}

function displayUrl(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`)
    const host = u.hostname.replace(/^www\./, "")
    const path = (u.pathname + (u.search || "")).replace(/^\/+/, "")
    const trimmedPath = path.length > 24 ? path.slice(0, 22) + "…" : path
    return trimmedPath ? `${host}/${trimmedPath}` : host
  } catch {
    return url
  }
}
