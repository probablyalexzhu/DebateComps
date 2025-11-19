    "use client";

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold">About DebateComps</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          DebateComps curates upcoming debate tournaments from around the world
          so that debaters, adjudicators, and organizers can plan their seasons
          with confidence. Our data comes directly from the Global Debating
          Spreadsheet and is refreshed automatically.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed">
          To add a tournament, visit the <a href="https://docs.google.com/spreadsheets/d/1R9s3MAh1H_7rJ9NQhO18p6o7bvekrIDTk27l7emXk6o/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Global Debating Spreadsheet</a>
          . Fill in the information for the tournament following the format of the other tournaments.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed">
          This site is built by Alex Zhu, Aditya Keerthi, and Barton Lu to make
          it easier for the debate community to discover opportunities from around the world.
        </p>
      </div>
    </div>
  );
}

