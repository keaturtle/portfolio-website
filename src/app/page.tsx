import { loadProjects } from '@/lib/projects';
import HeroSection from '@/components/HeroSection';
import StatsBar from '@/components/StatsBar';
import BentoGrid from '@/components/BentoGrid';
import ToolCard from '@/components/ToolCard';
import { Scissors, Package } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Keaten Tuttle — Portfolio',
  description:
    'Mechanical engineer, builder, and tool maker. Explore my engineering projects and interactive tools.',
  metadataBase: new URL('https://keatentuttle.vercel.app'),
  openGraph: {
    title: 'Keaten Tuttle — Portfolio',
    description: 'Mechanical engineer, builder, and tool maker.',
    images: ['/images/og-home.jpg'],
  },
};

export default function Home() {
  const projects = loadProjects();

  return (
    <>
      <HeroSection />
      <StatsBar />

      {/* Featured Projects */}
      <section id="projects" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <div
                className="text-[#006c49] text-[12px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                <span className="w-8 h-[1px] bg-[#006c49] inline-block" />
                Selected Works
              </div>
              <h2
                className="text-[48px] font-bold leading-[1.1] text-[#131b2e]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Featured Projects
              </h2>
            </div>
            <p className="text-[16px] leading-[1.5] text-[#3c4a42] max-w-md">
              A selection of engineering and design projects — from mechanical systems to software
              tools.
            </p>
          </div>
          <BentoGrid projects={projects} />
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full dot-grid opacity-20" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2
              className="text-[32px] font-semibold leading-[1.2] text-[#131b2e] mb-4"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              The Engineering Mindset
            </h2>
            <p className="text-[16px] leading-[1.5] text-[#3c4a42] max-w-2xl">
              &ldquo;Measure twice, cut once.&rdquo; My approach is rooted in understanding the
              problem fully before building the solution.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: '📐',
                title: 'Define & Model',
                desc: 'Understand constraints and model the problem before writing a single line of code or cutting a single piece of material.',
              },
              {
                icon: '🔧',
                title: 'Build & Iterate',
                desc: 'Build modular, testable solutions. Iterate based on real feedback rather than assumptions.',
              },
              {
                icon: '📊',
                title: 'Measure & Optimize',
                desc: "Use data to identify what's working and what isn't. Performance and efficiency are requirements, not afterthoughts.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="bg-white p-8 rounded-xl border border-[#bbcabf] shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-[#adedd3] rounded-lg flex items-center justify-center text-2xl mb-6">
                  {step.icon}
                </div>
                <h4
                  className="text-[24px] font-semibold leading-[1.3] text-[#131b2e] mb-4"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {step.title}
                </h4>
                <p className="text-[16px] leading-[1.5] text-[#3c4a42]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <div
              className="text-[#006c49] text-[12px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-2"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <span className="w-8 h-[1px] bg-[#006c49] inline-block" />
              Interactive Tools
            </div>
            <h2
              className="text-[48px] font-bold leading-[1.1] text-[#131b2e]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Tools I&apos;ve Built
            </h2>
            <p className="text-[16px] leading-[1.5] text-[#3c4a42] max-w-2xl mt-4">
              Practical tools built to solve real problems. Use them directly in your browser.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl">
            <ToolCard
              title="Plywood Cut Optimizer"
              description="Input your sheet dimensions and required pieces. Get an optimized cut layout that minimizes waste."
              href="/tools/plywood"
              Icon={Scissors}
            />
            <ToolCard
              title="TNutz Order Builder"
              description="Build and manage T-Nutz extrusion orders. Export a JSON file compatible with the automation script."
              href="/tools/tnutz"
              Icon={Package}
            />
          </div>
        </div>
      </section>
    </>
  );
}
