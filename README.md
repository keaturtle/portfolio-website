# Keaten Tuttle — Portfolio Website

Personal portfolio built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion. Deployed on Vercel.

## Features

- **Projects showcase** — Solar Concentrator, SUV Camp Platform, Keaten's Krunch, Utana Tech
- **Plywood Cut Optimizer** — Guillotine bin-packing algorithm with SVG visual output
- **TNutz Order Builder** — Build T-Nutz extrusion/hardware orders, export JSON for `tnutz_order.py`
- **Contact form** — Serverless function forwards messages to your email via Resend
- **SEO** — Per-page metadata, Open Graph tags, sitemap.xml

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial portfolio site"
git remote add origin https://github.com/YOUR_USERNAME/portfolio-website.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project** → import your `portfolio-website` repo
3. Vercel auto-detects Next.js — click **Deploy**

### 3. Add Environment Variables

In your Vercel project dashboard → **Settings** → **Environment Variables**, add:

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | Your Resend API key (get free at [resend.com](https://resend.com)) |
| `CONTACT_EMAIL` | Your email address (where contact form messages go) |

### 4. Custom Domain (optional)

In Vercel → **Settings** → **Domains**, add your custom domain.

## Adding a New Project

1. Add an entry to `content/projects/index.json`
2. Create `content/projects/your-slug.mdx` with frontmatter + content
3. Add a thumbnail image to `public/images/projects/`
4. Push to GitHub — Vercel auto-deploys

## Updating Your Resume

Replace `public/resume.pdf` with your actual PDF file, then push.

## Contact Form Setup

The contact form uses [Resend](https://resend.com) to send emails:

1. Sign up at resend.com (free tier: 3,000 emails/month)
2. Create an API key
3. Add `RESEND_API_KEY` to Vercel environment variables
4. Add `CONTACT_EMAIL` (your email) to Vercel environment variables

The form will forward messages to your email with the sender's email as Reply-To, so you can reply directly.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Space Grotesk + Inter (Google Fonts)
- **Email**: Resend
- **Content**: JSON + MDX files
- **Deployment**: Vercel
