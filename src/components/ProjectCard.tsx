'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProjectMeta } from '@/lib/types';

export default function ProjectCard({ project }: { project: ProjectMeta }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white border border-[#bbcabf] rounded-xl p-4 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] hover:border-[#10b981] cursor-pointer"
    >
      {/* Dot grid texture */}
      <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />

      {/* Image */}
      <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-[#e2e7ff] border border-[#bbcabf]/30">
        <div className="w-full h-full bg-gradient-to-br from-[#adedd3] to-[#eaedff] flex items-center justify-center">
          <span
            className="text-[#006c49] text-4xl font-bold opacity-20"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {project.title.charAt(0)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <Link href={`/projects/${project.slug}`}>
            <h3
              className="font-bold text-[24px] leading-[1.3] text-[#131b2e] group-hover:text-[#006c49] transition-colors"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {project.title}
            </h3>
          </Link>
        </div>
        <p className="text-[16px] leading-[1.5] text-[#3c4a42] line-clamp-3">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-[#adedd3] text-[#306d58] text-[12px] font-semibold uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
