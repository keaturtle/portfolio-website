'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Terminal, ArrowRight, Code2 } from 'lucide-react';

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
      };

  return (
    <section className="relative min-h-[819px] flex items-center overflow-hidden bg-white">
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid lg:grid-cols-2 gap-12 items-center py-24">
        {/* Left column */}
        <motion.div
          className="space-y-8"
          {...fadeUp}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Badge */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          >
            <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#adedd3] text-[#306d58] text-xs font-semibold uppercase tracking-wider">
              <Terminal size={14} />
              <span>Mechanical Engineer &amp; Builder</span>
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            className="font-bold text-[48px] leading-[1.1] text-[#131b2e] max-w-xl"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
            {...fadeUp}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
          >
            Designing Systems,{' '}
            <span className="text-[#10b981]">Engineering</span>{' '}
            Solutions.
          </motion.h1>

          {/* Lead paragraph */}
          <motion.p
            className="text-[18px] leading-[1.6] text-[#3c4a42] max-w-lg"
            {...fadeUp}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
          >
            Cal Poly SLO Mechanical Engineering graduate with a passion for building practical
            tools and solving real-world problems — from CAD models and FEA to software utilities.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-wrap gap-4"
            {...fadeUp}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.4 }}
          >
            <a
              href="#projects"
              className="bg-[#10b981] text-white px-8 py-4 rounded-lg flex items-center gap-2 hover:bg-[#006c49] transition-all shadow-[0_4px_20px_rgba(16,185,129,0.2)] font-semibold"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              View Projects
              <ArrowRight size={18} />
            </a>
            <a
              href="#tools"
              className="border border-[#6c7a71] text-[#131b2e] px-8 py-4 rounded-lg hover:bg-[#adedd3]/20 transition-all font-semibold"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Explore Tools
            </a>
          </motion.div>
        </motion.div>

        {/* Right column — hero card (hidden on mobile) */}
        <motion.div
          className="relative hidden lg:block"
          initial={shouldReduceMotion ? {} : { opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
        >
          {/* Decorative blur blob */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card */}
          <div className="border border-[#bbcabf] bg-white p-4 rounded-xl shadow-xl relative overflow-hidden group">
            {/* Placeholder image */}
            <div className="rounded-lg w-full h-[400px] bg-gradient-to-br from-[#adedd3] to-[#eaedff] flex items-center justify-center">
              <Code2 size={80} className="text-[#006c49] opacity-20" />
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 rounded-xl">
              <span className="text-white font-mono text-sm">
                {`/* Building things that matter */`}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
