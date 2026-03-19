"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SOURCES = [
  { href: "/", label: "Global", flag: "🌍" },
  { href: "/india", label: "India", flag: "🇮🇳" },
  { href: "/canada", label: "Canada", flag: "🇨🇦" },
];

export function CountryToggle() {
  const pathname = usePathname();
  const active = SOURCES.find((s) => s.href === pathname) ?? SOURCES[0];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none">
        <span>{active.flag}</span>
        <span className="hidden sm:inline">{active.label}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SOURCES.map(({ href, label, flag }) => (
          <DropdownMenuItem key={href} asChild>
            <Link href={href} className="flex items-center gap-2 cursor-pointer">
              <span>{flag}</span>
              <span>{label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
