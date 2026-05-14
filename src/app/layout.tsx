import type { Metadata } from "next";
import { Montserrat, Karla } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/custom/footer";
import { SiteHeader } from "@/components/custom/site-header";
import { ThemeProvider } from "@/lib/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/next"

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DebateComps — The world's debate calendar",
  description: "Where debaters, adjudicators, and organizers come together to find the best competitions.",
  openGraph: {
    title: "DebateComps — The world's debate calendar",
    description: "Where debaters, adjudicators, and organizers come together to find the best competitions.",
    url: "https://debatecomps.com",
    siteName: "DebateComps",
    images: [{ url: "https://debatecomps.com/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DebateComps — The world's debate calendar",
    description: "Where debaters, adjudicators, and organizers come together to find the best competitions.",
    images: ["https://debatecomps.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const theme = localStorage.getItem('theme');
              if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            `,
          }}
        />
      </head>
      <body
        className={`${montserrat.variable} ${karla.variable} antialiased`}
      >
        <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <SiteHeader />
            <main className="flex-1">
              {children}
              <Analytics />
            </main>
            <Footer />
          </div>
        </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
