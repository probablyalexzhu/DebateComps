"use client";

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold font-serif tracking-tight mb-8">About DebateComps</h1>

        <div className="space-y-10">
          <section>
            <h2 className="text-lg font-semibold mb-2">What is DebateComps?</h2>
            <p className="text-muted-foreground leading-relaxed">
              You know those spreadsheets the debate community uses to track every
              tournament? We turn those into something you can actually browse
              without losing your mind. Still very much a work in progress — we&apos;re
              actively building and breaking things.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Data is pulled directly from the{" "}
              <a href="https://docs.google.com/spreadsheets/d/1R9s3MAh1H_7rJ9NQhO18p6o7bvekrIDTk27l7emXk6o/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Global Debating Spreadsheet</a>
              {" "}(created by Senkai Hsia, managed by Claire Beamer), the{" "}
              <a href="https://docs.google.com/spreadsheets/d/1rc_ozfJbcZlrYAjWeMcIkN9E_uvJet9HX42M1wX4yzY" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">CUSID University Schedule</a>
              , and the{" "}
              <a href="https://docs.google.com/spreadsheets/d/1_LlgPi3rxGRpqr2AvP3Ngx1WjkDkarIkQqAn2itMceg" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Indian Debating Spreadsheet</a>
              , and refreshed automatically.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Add a tournament</h2>
            <p className="text-muted-foreground leading-relaxed">
              To add a tournament, visit the relevant spreadsheet and fill in the
              information following the format of the other tournaments.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Something broken?</h2>
            <p className="text-muted-foreground leading-relaxed">
              DebateComps reads directly from the spreadsheets. If the site is
              showing errors or missing data, it&apos;s likely that a spreadsheet
              was edited in a way the site doesn&apos;t expect (e.g. merged cells,
              renamed columns, moved headers). Fixing the spreadsheet will fix
              the site — no code changes needed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Built by</h2>
            <p className="text-muted-foreground leading-relaxed">
              <a href="https://probablyalex.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Alex Zhu</a>
              , Aditya Keerthi, Barton Lu, Acon Lin, and Advait Sangle — making
              it easier for the debate community to discover opportunities from
              around the world.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <a href="https://github.com/probablyalexzhu/DebateComps" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">View on GitHub</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

