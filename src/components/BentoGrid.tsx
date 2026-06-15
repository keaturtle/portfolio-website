'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProjectMeta } from '@/lib/types';

export default function BentoGrid({ projects }: { projects: ProjectMeta[] }) {
  const featured = projects.filter((p) => p.featured);
  const [large, ...sides] = featured;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-12 gap-8"
    >
      {/* Large card */}
      {large && (
        <Link href={`/projects/${large.slug}`} className="md:col-span-8 group cursor-pointer">
          <div
            className="relative overflow-hidden rounded-xl border border-[#bbcabf] aspect-video bg-gradient-to-br from-[#adedd3] to-[#eaedff]"
            style={large.thumbnail ? { backgroundImage: `url(${large.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e]/90 via-[#131b2e]/20 to-transparent p-8 flex flex-col justify-end">
              <div className="flex gap-2 mb-4">
                {large.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#10b981] text-white text-[12px] font-semibold uppercase tracking-wider rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3
                className="text-[32px] font-semibold leading-[1.2] text-white mb-2"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {large.title}
              </h3>
              <p className="text-white/80 text-[16px] max-w-xl">{large.description}</p>
            </div>
          </div>
        </Link>
      )}

      {/* Side cards */}
      <div className="md:col-span-4 flex flex-col gap-8">
        {sides.slice(0, 2).map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group cursor-pointer flex flex-col"
          >
            <div
              className="relative flex-grow overflow-hidden rounded-xl border border-[#bbcabf] mb-4 h-40 bg-gradient-to-br from-[#eaedff] to-[#adedd3] group-hover:scale-[1.02] transition-transform duration-500"
              style={project.thumbnail ? { backgroundImage: `url(${project.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
            />
            <h4
              className="text-[24px] font-semibold leading-[1.3] text-[#131b2e] group-hover:text-[#006c49] transition-colors"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {project.title}
            </h4>
            <p className="text-[#3c4a42] text-[16px] mb-4 line-clamp-2">{project.description}</p>
            <div className="flex gap-2">
              {project.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-[#adedd3] text-[#306d58] text-[10px] font-bold uppercase rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
