"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { CountryToggle } from "./country-toggle";

export function SiteHeader() {
  const navItems = [
    { href: "/saved", label: "Saved" },
    { href: "/about", label: "About" },
  ];

  return (
    <header
      className="border-b bg-background"
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold flex items-center gap-2">
          <Image
            src="/deb8.png"
            alt="DebateComps Logo"
            width={32}
            height={32}
            className="h-8 w-8 logo-spin"
          />
          <span className="hidden sm:inline font-serif tracking-tight">DebateComps</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <CountryToggle />
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

