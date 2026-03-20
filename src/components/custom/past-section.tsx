'use client';

import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { EventCard } from '@/components/custom/event-card';
import type { Tournament } from '@/types/tournament';

const GRID_CLASSNAME = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 sm:gap-6';

export function PastSection({ tournaments, className }: { tournaments: Tournament[]; className?: string }) {
  if (tournaments.length === 0) return null;

  return (
    <Collapsible className={className}>
      <CollapsibleTrigger className="group/past flex items-center gap-2 cursor-pointer mb-6">
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-data-[state=open]/past:rotate-90" />
        <h2 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
          Past ({tournaments.length})
        </h2>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={GRID_CLASSNAME}>
          {tournaments.map((tournament, index) => (
            <EventCard key={`past-${tournament.competitionName}-${index}`} tournament={tournament} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
