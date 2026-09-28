# Modern C++ Explained

Source for the book **[Modern C++ Explained](https://wx241.github.io/cpp-explained/)**, built with [mdBook](https://rust-lang.github.io/mdBook/).

## Writing

- Chapters live in `src/`; the table of contents is `src/SUMMARY.md`.
- Preview locally with live reload: run `run.bat` (Windows) or `mdbook serve --open`, then open http://localhost:3000.
- File and folder names are case-sensitive on the build server — make links in `SUMMARY.md` match the exact casing on disk.

## Publishing

Every push to `main` is built and deployed to GitHub Pages by `.github/workflows/deploy.yml`. There is no `gh-pages` branch to maintain. Pull requests are built (to catch broken links and bad paths) but not deployed.

## License

[CC BY-NC-SA 4.0](LICENSE.md) — © Wuping Xin
