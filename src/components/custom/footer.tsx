export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-10">
        <p className="text-center text-sm text-muted-foreground">
          Live data from{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/1R9s3MAh1H_7rJ9NQhO18p6o7bvekrIDTk27l7emXk6o/htmlview"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Global Debating Spreadsheet
          </a>
          . Made by{" "}
          <a
            href="https://probablyalex.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Alex Zhu
          </a>
          , Aditya Keerthi, Barton Lu
        </p>
      </div>
    </footer>
  );
}
