# Portfolio Website — Claude Code Handoff

## What this is

Keaten Tuttle's personal portfolio site. Built with Next.js 14, TypeScript, Tailwind CSS, deployed to Vercel.

**Live URL:** https://portfolio-website-m8sg.vercel.app  
**GitHub repo:** https://github.com/keaturtle/portfolio-website  
**Wix original (for reference):** https://keatentuttle.wixsite.com/portfolio

## Environment quirks — READ THIS FIRST

Node.js is installed at `C:\Program Files\nodejs` but is NOT in the default PowerShell PATH. Use one of:

```powershell
# Option A: use npm.cmd directly
& "C:\Program Files\nodejs\npm.cmd" run build

# Option B: prepend to PATH then use npm
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH; npm run build

# Option C (for new terminal sessions): ExecutionPolicy bypass
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm run build
```

Git was added to the system PATH via `setx`. It should work in new sessions as `git`.

## Project structure

```
portfolio-website/
├── content/projects/        # MDX files + index.json for project content
├── public/
│   ├── images/projects/     # Project thumbnail images (PLACEHOLDERS — need real ones)
│   └── resume.pdf           # Placeholder — need real resume
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Home (Hero, Stats, Bento Grid, Process, Tools)
│   │   ├── about/           # About page (bio, skills, education)
│   │   ├── contact/         # Contact form page
│   │   ├── projects/        # Projects index + [slug] detail pages
│   │   ├── tools/           # Tools landing + /plywood + /tnutz
│   │   ├── api/contact/     # Serverless email endpoint (uses Resend)
│   │   └── sitemap.ts       # Auto-generated sitemap
│   ├── components/          # React components
│   │   ├── Navbar.tsx       # Sticky frosted-glass nav, mobile hamburger
│   │   ├── Footer.tsx       # Footer with links
│   │   ├── HeroSection.tsx  # Full-screen hero with animations
│   │   ├── BentoGrid.tsx    # Project card grid
│   │   ├── StatsBar.tsx     # Stats/numbers bar
│   │   ├── ProjectCard.tsx  # Individual project card
│   │   ├── ToolCard.tsx     # Tool preview card
│   │   ├── ContactForm.tsx  # Contact form with validation
│   │   └── tools/
│   │       ├── PlywoodOptimizer.tsx  # Plywood cut optimizer UI
│   │       └── TnutzOrderBuilder.tsx # T-Nutz order builder UI
│   └── lib/
│       ├── types.ts          # All TypeScript interfaces
│       ├── projects.ts       # Project content loader (reads MDX + index.json)
│       ├── plywoodOptimizer.ts   # Guillotine bin-packing algorithm
│       ├── tnutzStorage.ts   # localStorage-backed order state
│       └── validateContact.ts # Contact form validation
├── vercel.json              # Forces Next.js framework detection on Vercel
└── .env.example             # Template for required env vars
```

## Design system

**Theme:** Light (not dark). White/off-white bg, dark navy text, emerald green accent.

| Token | Value | Use |
|-------|-------|-----|
| Background | `#faf8ff` | Page background |
| Primary text | `#131b2e` | Headings, body |
| Secondary text | `#3c4a42` | Subtext, descriptions |
| Primary accent | `#006c49` | Labels, borders, dark green |
| Primary CTA | `#10b981` | Buttons, highlights |
| Mint container | `#adedd3` | Chips, icon backgrounds |
| Border | `#bbcabf` | Card borders |
| Muted | `#6c7a71` | Placeholders, secondary labels |

**Fonts:**  
- Headings: `Space Grotesk` (loaded via `next/font/google`, var `--font-space-grotesk`)  
- Body: `Inter` (loaded via `next/font/google`, var `--font-inter`)

**Animations:** Framer Motion for fade-up reveals, hover effects. `useReducedMotion` respected.

**Dot grid:** `.dot-grid` CSS utility class (radial gradient, 24px spacing, slate-300 dots).

## Routes (all 16 built and deployed)

| Route | Description |
|-------|-------------|
| `/` | Home: Hero, StatsBar, BentoGrid projects, Process, ToolCards |
| `/projects` | All projects grid |
| `/projects/[slug]` | MDX detail page (solar-concentrator, suv-camp-platform, keatens-krunch, utana-tech) |
| `/tools` | Tools landing page |
| `/tools/plywood` | Plywood Cut Optimizer (SVG output, guillotine algorithm) |
| `/tools/tnutz` | TNutz Order Builder (localStorage, JSON export) |
| `/about` | Bio, skills, education, resume download |
| `/contact` | Contact form |
| `/api/contact` | POST endpoint — sends email via Resend |
| `/sitemap.xml` | Auto-generated |

## Content that needs real data (current placeholders)

1. **Profile photo** — `public/images/profile.jpg` (referenced in About but not yet wired; About currently shows `KT` initials placeholder)
2. **Project images** — `public/images/projects/*.jpg` (4 files needed: solar-concentrator, suv-camp-platform, keatens-krunch, utana-tech)
3. **Resume PDF** — `public/resume.pdf` (currently 53B empty placeholder)
4. **Hero right-panel image** — HeroSection shows a placeholder gradient card; could be a real photo
5. **Project MDX content** — All 4 MDX files have basic bullet-point content; they should be expanded with real details, photos, links

## Wix content to migrate

Original Wix site: https://keatentuttle.wixsite.com/portfolio

Content to pull over:
- Bio text and personal details → `src/app/about/page.tsx`
- Project descriptions and any photos → `content/projects/*.mdx` + `public/images/projects/`
- Social links (LinkedIn, GitHub) — currently hardcoded as `linkedin.com/in/keatentuttle` and `github.com/keatentuttle` (verify these are correct)
- Any additional skills, experience, or education info

## Environment variables

Required in Vercel dashboard (Settings → Environment Variables):

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `RESEND_API_KEY` | Email sending | resend.com → free account → API Keys |
| `CONTACT_EMAIL` | Where contact emails are delivered | `keatentuttle@gmail.com` |

Without `RESEND_API_KEY`, contact form submissions return 500 but the rest of the site works fine.

## How to deploy changes

```powershell
# From portfolio-website directory
git add <files>
git commit -m "Description"
git push
# Vercel auto-deploys from main branch in ~60s
```

## How to run locally

```powershell
cd "C:\Users\keate\OneDrive\Documents\Scripts\Personal Website\portfolio-website"
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
npm run dev
# Site at http://localhost:3000
```

## How to add a new project

1. Add entry to `content/projects/index.json`
2. Create `content/projects/your-slug.mdx` with frontmatter + content
3. Add thumbnail image to `public/images/projects/your-slug.jpg`
4. Push to GitHub — auto-deploys

## Python tools (original scripts, not in the website)

The original Python scripts that inspired the web tools live in:
- `C:\Users\keate\OneDrive\Documents\Scripts\Personal Website\Scripts\TNutz order\tnutz_order.py` — Playwright automation for tnutz.com cart
- `C:\Users\keate\OneDrive\Documents\Scripts\Personal Website\Scripts\Plywood Cut Tool\plywood_cut_optimizer.py`

The TNutz web tool exports a JSON file (`tnutz_order_data.json`) compatible with `order_data.py` schema.

## About the user

Keaten Tuttle — Mechanical Engineering graduate (BS ME). Not a software engineer by training — prefers clear explanations and working solutions over technical jargon. Uses Python regularly. Comfortable with terminal commands when given exact copy-paste instructions.

Email: keatentuttle@gmail.com
