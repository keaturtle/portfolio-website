'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: '6+', label: 'Projects Completed' },
  { value: '2', label: 'Tools Built' },
  { value: 'Cal Poly', label: 'BS Mech. Engineering' },
  { value: '1', label: 'Startup Founded' },
];

function StatItem({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className="text-center md:text-left"
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
    >
      <div
        className="text-[32px] font-bold text-[#10b981]"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {stat.value}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wider text-[#3c4a42] mt-1">
        {stat.label}
      </div>
    </motion.div>
  );
}

export default function StatsBar() {
  return (
    <section className="bg-[#eaedff] py-16 border-y border-[#bbcabf]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
        {stats.map((stat, i) => (
          <StatItem key={stat.label} stat={stat} index={i} />
        ))}
      </div>
    </section>
  );
}
