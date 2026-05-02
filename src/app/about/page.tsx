import type { Metadata } from 'next';
import { Github, Linkedin, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: 'Mechanical engineer, builder, and tool maker. Learn about Keaten Tuttle\'s background, skills, and experience.',
};

const skills = [
  { category: 'Mechanical Engineering', items: ['SolidWorks', 'CAD/CAM', 'FEA', 'Thermal Analysis', 'Fabrication', 'GD&T'] },
  { category: 'Software & Tools', items: ['Python', 'TypeScript', 'Next.js', 'Playwright', 'Git', 'Linux'] },
  { category: 'Design & Build', items: ['Woodworking', 'Prototyping', 'Design-Build', 'Product Development'] },
  { category: 'Business', items: ['Entrepreneurship', 'Pitch Competitions', 'Non-Profit Management', 'Project Management'] },
];

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20 bg-[#faf8ff]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <div className="text-[#006c49] text-[12px] font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <span className="w-8 h-[1px] bg-[#006c49] inline-block" />
              About Me
            </div>
            <h1 className="text-[48px] font-bold leading-[1.1] text-[#131b2e] mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Keaten Tuttle
            </h1>
            <p className="text-[18px] leading-[1.6] text-[#3c4a42] mb-6">
              Mechanical engineering graduate with a passion for building practical things — whether that&apos;s a solar concentrator, a camp platform for my Subaru, or a Python script that automates ordering T-slot extrusions.
            </p>
            <p className="text-[18px] leading-[1.6] text-[#3c4a42] mb-8">
              I believe the best engineers are the ones who can move fluidly between the physical and digital worlds. I&apos;m equally comfortable with a SolidWorks model and a terminal window.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/resume.pdf"
                download
                className="inline-flex items-center gap-2 bg-[#10b981] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#006c49] transition-all shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                <Download size={18} />
                Download Resume
              </a>
              <a
                href="https://linkedin.com/in/keatentuttle"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-[#6c7a71] text-[#131b2e] px-6 py-3 rounded-lg font-semibold hover:bg-[#adedd3]/20 transition-all"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                <Linkedin size={18} />
                LinkedIn
              </a>
              <a
                href="https://github.com/keatentuttle"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-[#6c7a71] text-[#131b2e] px-6 py-3 rounded-lg font-semibold hover:bg-[#adedd3]/20 transition-all"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                <Github size={18} />
                GitHub
              </a>
            </div>
          </div>

          {/* Profile photo placeholder */}
          <div className="relative hidden lg:block">
            <div className="absolute -top-8 -right-8 w-48 h-48 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="border border-[#bbcabf] bg-white p-4 rounded-xl shadow-xl">
              <div className="rounded-lg w-full h-[400px] bg-gradient-to-br from-[#adedd3] to-[#eaedff] flex items-center justify-center">
                <span className="text-[#006c49] text-8xl font-bold opacity-20" style={{ fontFamily: 'var(--font-space-grotesk)' }}>KT</span>
              </div>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="mb-24">
          <div className="mb-12">
            <span className="text-[#006c49] font-mono text-[14px] mb-2 block">/* Skills &amp; Expertise */</span>
            <h2 className="text-[32px] font-semibold leading-[1.2] text-[#131b2e]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              What I Work With
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.map((group) => (
              <div key={group.category} className="bg-white p-8 rounded-xl border border-[#bbcabf] shadow-sm hover:shadow-md hover:border-[#10b981] transition-all">
                <h3 className="text-[18px] font-semibold text-[#131b2e] mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-full bg-[#adedd3] text-[#306d58] text-[12px] font-semibold uppercase tracking-wider">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="mb-24">
          <div className="mb-12">
            <span className="text-[#006c49] font-mono text-[14px] mb-2 block">/* Background */</span>
            <h2 className="text-[32px] font-semibold leading-[1.2] text-[#131b2e]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Education &amp; Experience
            </h2>
          </div>
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl border border-[#bbcabf] shadow-sm grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-[#6c7a71] text-[12px] font-semibold uppercase tracking-wider mb-1">Degree</p>
                <p className="text-[24px] font-bold text-[#006c49]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>B.S. Mechanical Engineering</p>
              </div>
              <div>
                <p className="text-[#6c7a71] text-[12px] font-semibold uppercase tracking-wider mb-1">Focus</p>
                <p className="text-[16px] text-[#131b2e]">Design, fabrication, thermal systems, and applied mechanics</p>
              </div>
              <div>
                <p className="text-[#6c7a71] text-[12px] font-semibold uppercase tracking-wider mb-1">Notable</p>
                <p className="text-[16px] text-[#131b2e]">Pitch competition winner · Non-profit founder · Independent tool builder</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
