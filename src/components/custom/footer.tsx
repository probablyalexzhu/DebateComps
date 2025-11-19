export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
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
          . Made by Alex Zhu, Aditya Keerthi, Barton Lu
        </p>
      </div>
    </footer>
  );
}
