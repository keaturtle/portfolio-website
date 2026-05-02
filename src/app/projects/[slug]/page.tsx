import { notFound } from 'next/navigation';
import { loadProjects, getProjectSlugs } from '@/lib/projects';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Github, ExternalLink } from 'lucide-react';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const projects = loadProjects();
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) return { title: 'Project Not Found' };

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.thumbnail],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const projects = loadProjects();
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  const mdxPath = path.join(process.cwd(), 'content/projects', `${params.slug}.mdx`);
  if (!fs.existsSync(mdxPath)) notFound();

  const raw = fs.readFileSync(mdxPath, 'utf-8');
  const { content } = matter(raw);

  return (
    <div className="pt-24 pb-20 bg-[#faf8ff]">
      {/* Back link */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-[#3c4a42] hover:text-[#006c49] transition-colors text-[14px] font-medium"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          <ArrowLeft size={16} />
          All Projects
        </Link>
      </div>

      {/* Hero section */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-12">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-[#adedd3] text-[#306d58] px-3 py-1 rounded-full text-[12px] font-semibold uppercase tracking-wider">
                {project.tags[0]}
              </span>
            </div>
            <h1
              className="text-[48px] font-bold leading-[1.1] text-[#131b2e] mb-6"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {project.title}
            </h1>
            <p className="text-[18px] leading-[1.6] text-[#3c4a42] max-w-2xl">
              {project.description}
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end gap-4 pb-2">
            <a
              href="#"
              className="flex items-center gap-2 px-6 py-3 border border-[#6c7a71] rounded-lg text-[#131b2e] hover:bg-[#eaedff] transition-all"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <Github size={18} />
              GitHub
            </a>
          </div>
        </div>

        {/* Banner image placeholder */}
        <div className="relative rounded-xl overflow-hidden border border-[#bbcabf] shadow-2xl bg-gradient-to-br from-[#adedd3] to-[#eaedff]" style={{ aspectRatio: '21/9' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[#006c49] text-8xl font-bold opacity-10"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {project.title.charAt(0)}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e]/20 to-transparent" />
        </div>
      </section>

      {/* Tech stack bento */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="mb-8">
          <span className="text-[#006c49] font-mono text-[14px] mb-2 block">/* Technical Overview */</span>
          <h2 className="text-[32px] font-semibold leading-[1.2] text-[#131b2e]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Core Details
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tags card */}
          <div className="p-8 rounded-xl border border-[#bbcabf] bg-[#faf8ff] dot-grid flex flex-col justify-between hover:border-[#006c49] transition-colors group">
            <div>
              <h3 className="text-[24px] font-semibold leading-[1.3] text-[#131b2e] mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Tags &amp; Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="bg-[#adedd3] text-[#306d58] px-3 py-1 rounded-full text-[12px] font-semibold uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Date card */}
          <div className="p-8 rounded-xl border border-[#bbcabf] bg-[#f2f3ff] flex flex-col justify-center">
            <p className="text-[#6c7a71] text-[12px] font-semibold uppercase tracking-wider mb-1">Completed</p>
            <p className="text-[32px] font-bold text-[#006c49]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {new Date(project.date + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* MDX content */}
      <section className="max-w-3xl mx-auto px-6">
        <article className="prose prose-slate prose-headings:font-space-grotesk prose-headings:text-[#131b2e] prose-a:text-[#006c49] prose-strong:text-[#131b2e] max-w-none">
          <MDXRemote source={content} />
        </article>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <div className="bg-[#006c49] text-white p-12 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-[32px] font-semibold leading-[1.2] mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Interested in working together?
            </h2>
            <p className="text-[18px] leading-[1.6] opacity-90">
              I&apos;m open to engineering collaborations, freelance projects, and full-time opportunities.
            </p>
          </div>
          <div className="flex shrink-0 gap-4 relative z-10">
            <Link
              href="/contact"
              className="bg-white text-[#006c49] px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-xl"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Get in Touch
            </Link>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
