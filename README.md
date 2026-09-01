# Professional Profile — Melisa Onofri

Portfolio site and CV source files.

**Live site:** https://onofrimelisa.github.io

## Structure

```
.
├── portfolio-site/       # Astro + Tailwind CSS v4 portfolio source
│   ├── src/
│   │   ├── config.ts     # All content (EN/ES) in a single file
│   │   ├── components/   # Astro components (Hero, About, Skills, etc.)
│   │   └── pages/        # Single-page layout
│   └── public/cv.pdf     # CV PDF served for download
├── resume/
│   └── silver-dev-cv/    # Typst CV source
│       ├── cv.typ        # Full CV source
│       └── cv.pdf        # Compiled PDF
├── docs/                 # Built portfolio (GitHub Pages serves from here)
├── raw/                  # Raw experience data
├── linkedin/             # LinkedIn profile texts
└── personal-docs/        # Diplomas, certificates, transcripts
```

## Portfolio Site

Built with **Astro** and **Tailwind CSS v4**. Bilingual (English default, Spanish toggle). Sections: About, Skills, Experience, Education, Certifications.

### Local development

```bash
cd portfolio-site
npm install
npm run dev       # Dev server at localhost:4321
npm run build     # Build to ../docs/
npm run preview   # Preview build
```

### Deploy

Push to `main` — GitHub Pages auto-deploys from `docs/`.

```bash
cd portfolio-site
npm run build
cd ..
git add portfolio-site/ docs/
git commit -m "Update portfolio"
git push origin main
```

## CV (Typst)

The CV is built with [Typst](https://typst.app/) using the `silver-dev-cv` template.

### Edit and compile

```bash
cd resume/silver-dev-cv
# Edit cv.typ
typst compile cv.typ cv.pdf
```

### Update CV in portfolio

After compiling the CV, copy it to the portfolio and redeploy:

```bash
cp resume/silver-dev-cv/cv.pdf portfolio-site/public/cv.pdf
cd portfolio-site && npm run build && cd ..
git add resume/ portfolio-site/public/cv.pdf docs/cv.pdf
git commit -m "Update CV"
git push origin main
```

## Tech Stack

| Component | Tech |
|-----------|------|
| Portfolio | Astro, Tailwind CSS v4, TypeScript |
| CV | Typst (silver-dev-cv template) |
| Hosting | GitHub Pages (docs/ folder) |
| i18n | Client-side toggle (EN/ES) via data attributes |
