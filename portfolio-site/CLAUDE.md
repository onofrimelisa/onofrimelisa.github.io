# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Melisa Onofri's personal portfolio site built with Astro and Tailwind CSS v4. Bilingual (EN/ES) with client-side language toggle. Deployed to GitHub Pages at https://onofrimelisa.github.io.

## Tech Stack

- **Astro**: Static site generator
- **Tailwind CSS v4**: Utility-first CSS framework using the new @tailwindcss/vite plugin
- **TypeScript**: For type-safe configuration

## Development Commands

Run from `portfolio-site/`:

```bash
npm run dev       # Start development server
npm run build     # Build for production (outputs to ../docs/)
npm run preview   # Preview production build
```

## Deployment

The site is deployed via GitHub Pages serving from the `docs/` folder on `main` branch.

To deploy changes:
1. Make changes in `portfolio-site/src/`
2. Run `npm run build` from `portfolio-site/`
3. Commit both `portfolio-site/` source changes and `docs/` build output
4. Push to `main`

## Updating the CV PDF

The CV PDF served in the portfolio (`public/cv.pdf`) is a **manual copy** from `resume/silver-dev-cv/cv.pdf`. It does NOT auto-update. After modifying the CV:

```bash
# 1. Compile the Typst CV
cd resume/silver-dev-cv
typst compile cv.typ cv.pdf

# 2. Copy to portfolio
cp cv.pdf ../../portfolio-site/public/cv.pdf

# 3. Rebuild the site
cd ../../portfolio-site
npm run build

# 4. Commit and push
cd ..
git add portfolio-site/public/cv.pdf docs/cv.pdf
git commit -m "Update CV PDF in portfolio"
git push origin main
```

## Architecture

Component-based architecture with all content centralized in `src/config.ts`:

- **Components** (`src/components/`): Hero, About, Skills, Experience, Education, Certifications, Header, Footer
- **Main Layout** (`src/pages/index.astro`): Single-page layout importing all components
- **Configuration** (`src/config.ts`): Single source of truth for all content (EN and ES)

### Key Architectural Decisions

1. **Single Configuration File**: All content managed through `src/config.ts`
2. **i18n via data attributes**: Both EN and ES content rendered in HTML, toggled client-side with `data-lang-en`/`data-lang-es` attributes
3. **Language preference**: Saved to localStorage, defaults to EN
4. **Accent Color**: Purple/violet (`#7c3aed`) propagated via inline styles
5. **Responsive layout**: Two-column grid (title + content) only at `2xl` (1536px+), stacked below that

## Configuration Structure

`src/config.ts` exports `siteConfig` with:
- Basic info: name, accentColor, cvPath
- Social links: email, linkedin, github
- `en` and `es` objects containing all translatable content:
  - title, greeting, aboutMe
  - skills: categorized object (Languages & Frameworks, Cloud & Infra, Databases, Observability, Practices) — kept in English for both languages
  - experience: array of {company, title, dateRange, bullets}
  - education: array of {school, degree, dateRange, achievements}
  - certifications: array of {name, issuer, year}
