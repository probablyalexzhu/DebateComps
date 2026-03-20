export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-10">
        <p className="text-center text-sm text-muted-foreground">
          Live data from{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/1R9s3MAh1H_7rJ9NQhO18p6o7bvekrIDTk27l7emXk6o"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            GDS
          </a>
          ,{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/1_LlgPi3rxGRpqr2AvP3Ngx1WjkDkarIkQqAn2itMceg"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            IDS
          </a>
          , and{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/1rc_ozfJbcZlrYAjWeMcIkN9E_uvJet9HX42M1wX4yzY"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            CUSID
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
          , Advait Sangle, Aditya Keerthi, Barton Lu
        </p>
      </div>
    </footer>
  );
}
