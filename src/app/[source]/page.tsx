"use client";

import { useParams } from "next/navigation";
import { TournamentsPage } from "@/components/custom/tournaments-page";

export default function SourcePage() {
  const params = useParams();
  const source = typeof params.source === 'string' ? params.source : 'global';
  return <TournamentsPage source={source} />;
}
