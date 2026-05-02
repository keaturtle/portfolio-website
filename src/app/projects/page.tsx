import { loadProjects } from '@/lib/projects';
import ProjectGrid from '@/components/ProjectGrid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Engineering and design projects by Keaten Tuttle — from mechanical systems to software tools.',
};

export default function ProjectsPage() {
  const projects = loadProjects();

  return (
    <div className="pt-24 pb-20 bg-[#faf8ff]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center gap-2 mb-3 text-[#006c49]" style={{ fontFamily: 'monospace' }}>
            <span className="text-[14px]">/* project_gallery */</span>
          </div>
          <h1 className="text-[48px] font-bold leading-[1.1] text-[#131b2e] mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Engineering Projects
          </h1>
          <p className="text-[18px] leading-[1.6] text-[#3c4a42] max-w-2xl">
            A curated selection of engineering and design work — from mechanical systems and fabrication to software tools and startups.
          </p>
        </header>

        {/* Grid */}
        <ProjectGrid projects={projects} />

        {/* CTA card at bottom */}
        <div className="mt-12 flex flex-col justify-center items-center p-12 border-2 border-dashed border-[#bbcabf] rounded-xl text-center bg-[#f2f3ff] hover:bg-emerald-50 transition-colors">
          <h3 className="text-[24px] font-semibold text-[#131b2e] mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Have a project in mind?
          </h3>
          <p className="text-[16px] text-[#3c4a42] mb-6 max-w-md">
            I&apos;m always interested in new engineering challenges and collaborations.
          </p>
          <a
            href="/contact"
            className="bg-[#006c49] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
}
