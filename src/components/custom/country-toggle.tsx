"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SOURCE_LIST } from "@/lib/sources";

function FlagIcon({ code, className }: { code: string | null; className?: string }) {
  if (!code) return <span className="inline-flex justify-center" style={{ width: '1.33rem' }}><Globe className={className ?? "h-4 w-4 text-foreground"} /></span>;
  return <span className={`fi fi-${code} rounded-[0.25rem]`} style={{ fontSize: '1rem' }} />;
}

export function CountryToggle() {
  const pathname = usePathname();
  const active = SOURCE_LIST.find((s) => s.route === pathname) ?? SOURCE_LIST[0];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none sm:w-24">
        <FlagIcon code={active.flagCode} />
        <span className="hidden sm:inline">{active.dropdownLabel}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Select Source</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SOURCE_LIST.map(({ route, dropdownLabel, flagCode }) => (
          <DropdownMenuItem key={route} asChild>
            <Link href={route} className="flex items-center gap-2 cursor-pointer">
              <FlagIcon code={flagCode} />
              <span>{dropdownLabel}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
