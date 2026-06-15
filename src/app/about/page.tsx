import type { Metadata } from 'next';
import { Github, Linkedin, Download, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: "Mechanical engineering graduate from Cal Poly SLO. Learn about Keaten Tuttle's background, skills, and experience.",
};

const skills = [
  {
    category: 'Mechanical Engineering',
    items: ['SolidWorks', 'CAD/CAM', 'FEA', 'Thermal Analysis', 'Fabrication', 'GD&T', 'MATLAB', 'Sustainable Design'],
  },
  {
    category: 'Software & Tools',
    items: ['Python', 'TypeScript', 'Next.js', 'Playwright', 'Git', 'Linux', 'Adobe Creative Suite', 'Excel'],
  },
  {
    category: 'Design & Build',
    items: ['Woodworking', 'Prototyping', 'Design-Build', 'Product Development', '3D Printing', 'Photography'],
  },
  {
    category: 'Business',
    items: ['Entrepreneurship', 'Pitch Competitions', 'Non-Profit Management', 'Project Management', 'Technical Communication'],
  },
];

const timeline = [
  {
    period: '2013 – 2017',
    title: 'Placer High School',
    detail: '4.3 GPA · Leadership roles · 3D printing tech specialist',
  },
  {
    period: '2017 – 2018',
    title: 'Gap Year',
    detail: 'Worked multiple jobs · Traveled and volunteered across Europe and Southeast Asia',
  },
  {
    period: '2018 – 2022',
    title: 'Cal Poly San Luis Obispo',
    detail: 'BS Mechanical Engineering · Minor in Business Entrepreneurship',
  },
  {
    period: '2020 – Present',
    title: 'Clark Pacific — Product Development Intern',
    detail: 'CAD design for the Infinite Facade prefabricated construction product',
  },
];

const interests = [
  'Backpacking', 'Surfing', 'Making things', 'Photography',
  'Climbing', 'Pottery', 'Skateboarding', 'Cooking', 'Traveling',
];

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20 bg-[#faf8ff]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <div
              className="text-[#006c49] text-[12px] font-semibold uppercase tracking-wider mb-4 flex items-center gap-2"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <span className="w-8 h-[1px] bg-[#006c49] inline-block" />
              About Me
            </div>
            <h1
              className="text-[48px] font-bold leading-[1.1] text-[#131b2e] mb-6"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Keaten Tuttle
            </h1>
            <p className="text-[18px] leading-[1.6] text-[#3c4a42] mb-4">
              Cal Poly SLO Mechanical Engineering graduate with a Business Entrepreneurship minor.
              I&apos;m a passionate person who works hard to make a difference — whether that&apos;s designing
              a solar concentrator, building a sleeping platform for my Subaru, or writing Python scripts
              that automate real-world tasks.
            </p>
            <p className="text-[18px] leading-[1.6] text-[#3c4a42] mb-8">
              I believe the best engineers move fluidly between the physical and digital worlds.
              I&apos;m equally comfortable with a SolidWorks model, a woodworking bench, and a terminal window.
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
                href="https://www.linkedin.com/in/keatentuttle/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-[#6c7a71] text-[#131b2e] px-6 py-3 rounded-lg font-semibold hover:bg-[#adedd3]/20 transition-all"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                <Linkedin size={18} />
                LinkedIn
              </a>
              <a
                href="https://github.com/keaturtle"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-[#6c7a71] text-[#131b2e] px-6 py-3 rounded-lg font-semibold hover:bg-[#adedd3]/20 transition-all"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                <Github size={18} />
                GitHub
              </a>
              <a
                href="mailto:keatentuttle@gmail.com"
                className="inline-flex items-center gap-2 border border-[#6c7a71] text-[#131b2e] px-6 py-3 rounded-lg font-semibold hover:bg-[#adedd3]/20 transition-all"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                <Mail size={18} />
                Email Me
              </a>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -top-8 -right-8 w-48 h-48 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="border border-[#bbcabf] bg-white p-4 rounded-xl shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/profile.jpg"
                alt="Keaten Tuttle"
                className="rounded-lg w-full h-[400px] object-cover object-top"
              />
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="mb-24">
          <div className="mb-12">
            <span className="text-[#006c49] font-mono text-[14px] mb-2 block">{'/* Skills & Expertise */'}</span>
            <h2
              className="text-[32px] font-semibold leading-[1.2] text-[#131b2e]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              What I Work With
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.map((group) => (
              <div
                key={group.category}
                className="bg-white p-8 rounded-xl border border-[#bbcabf] shadow-sm hover:shadow-md hover:border-[#10b981] transition-all"
              >
                <h3
                  className="text-[18px] font-semibold text-[#131b2e] mb-4"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full bg-[#adedd3] text-[#306d58] text-[12px] font-semibold uppercase tracking-wider"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education & Experience Timeline */}
        <section className="mb-24">
          <div className="mb-12">
            <span className="text-[#006c49] font-mono text-[14px] mb-2 block">{'/* Background */'}</span>
            <h2
              className="text-[32px] font-semibold leading-[1.2] text-[#131b2e]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Education &amp; Experience
            </h2>
          </div>
          <div className="space-y-4">
            {timeline.map((item) => (
              <div
                key={item.title}
                className="bg-white p-6 rounded-xl border border-[#bbcabf] shadow-sm grid md:grid-cols-[180px_1fr] gap-4 md:gap-8 hover:border-[#10b981] transition-all"
              >
                <div>
                  <p className="text-[#10b981] font-mono text-[13px] font-semibold">{item.period}</p>
                </div>
                <div>
                  <p
                    className="text-[18px] font-bold text-[#131b2e] mb-1"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    {item.title}
                  </p>
                  <p className="text-[15px] text-[#3c4a42]">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interests */}
        <section className="mb-12">
          <div className="mb-8">
            <span className="text-[#006c49] font-mono text-[14px] mb-2 block">{'/* Outside the Shop */'}</span>
            <h2
              className="text-[32px] font-semibold leading-[1.2] text-[#131b2e]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              When I&apos;m Not Engineering
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {interests.map((interest) => (
              <span
                key={interest}
                className="px-4 py-2 rounded-full border border-[#bbcabf] bg-white text-[#3c4a42] text-[14px] font-medium hover:border-[#10b981] hover:bg-[#adedd3]/10 transition-all"
              >
                {interest}
              </span>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
