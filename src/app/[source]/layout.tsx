import type { Metadata } from "next";
import { SOURCE_CONFIGS } from "@/lib/sources";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ source: string }>;
}): Promise<Metadata> {
  const { source } = await params;
  const config = SOURCE_CONFIGS[source];

  if (!config || !config.label) {
    return {};
  }

  const title = `DebateComps — ${config.label}'s debate calendar`;
  const description = `Where debaters, adjudicators, and organizers come together to find the best competitions in ${config.label}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: config.route,
      siteName: "DebateComps",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function SourceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
