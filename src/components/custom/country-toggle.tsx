"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SOURCES = [
  { href: "/",        label: "Global",  flagCode: null },
  { href: "/india",   label: "India",   flagCode: "in" },
  { href: "/canada",  label: "Canada",  flagCode: "ca" },
];

function FlagIcon({ code, className }: { code: string | null; className?: string }) {
  if (!code) return <Globe className={className ?? "h-4 w-4"} />;
  return <span className={`fi fi-${code} rounded-sm`} style={{ fontSize: '1rem' }} />;
}

export function CountryToggle() {
  const pathname = usePathname();
  const active = SOURCES.find((s) => s.href === pathname) ?? SOURCES[0];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none">
        <FlagIcon code={active.flagCode} />
        <span className="hidden sm:inline">{active.label}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SOURCES.map(({ href, label, flagCode }) => (
          <DropdownMenuItem key={href} asChild>
            <Link href={href} className="flex items-center gap-2 cursor-pointer">
              <FlagIcon code={flagCode} />
              <span>{label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
