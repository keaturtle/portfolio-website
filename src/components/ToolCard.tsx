import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  Icon: LucideIcon;
}

export default function ToolCard({ title, description, href, Icon }: ToolCardProps) {
  return (
    <div className="group relative bg-white border border-[#bbcabf] rounded-xl p-8 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] hover:border-[#10b981]">
      <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />
      <div className="relative">
        <div className="w-12 h-12 bg-[#adedd3] rounded-lg flex items-center justify-center text-[#10b981] mb-6">
          <Icon size={24} />
        </div>
        <h3
          className="text-[24px] font-semibold leading-[1.3] text-[#131b2e] mb-3 group-hover:text-[#006c49] transition-colors"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {title}
        </h3>
        <p className="text-[16px] leading-[1.5] text-[#3c4a42] mb-6">{description}</p>
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-[#10b981] font-semibold hover:text-[#006c49] transition-colors"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Try it →
        </Link>
      </div>
    </div>
  );
}
