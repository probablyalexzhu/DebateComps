"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/saved", label: "Saved" },
    { href: "/about", label: "About" },
  ];

  return (
    <header
      className="border-b bg-background"
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          DebateComps
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
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

