import type { Metadata } from 'next';
import ToolCard from '@/components/ToolCard';
import { Scissors, Package } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tools',
  description: 'Interactive browser-based tools built by Keaten Tuttle — Plywood Cut Optimizer and TNutz Order Builder.',
};

export default function ToolsPage() {
  return (
    <div className="pt-24 pb-20 bg-[#faf8ff]">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-16">
          <div className="flex items-center gap-2 mb-3 text-[#006c49]" style={{ fontFamily: 'monospace' }}>
            <span className="text-[14px]">/* tools.index */</span>
          </div>
          <h1 className="text-[48px] font-bold leading-[1.1] text-[#131b2e] mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Interactive Tools
          </h1>
          <p className="text-[18px] leading-[1.6] text-[#3c4a42] max-w-2xl">
            Practical tools I&apos;ve built to solve real problems. Run entirely in your browser — no account needed.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl">
          <ToolCard
            title="Plywood Cut Optimizer"
            description="Input your sheet dimensions and required pieces. Get an optimized cut layout diagram that minimizes material waste."
            href="/tools/plywood"
            Icon={Scissors}
          />
          <ToolCard
            title="TNutz Order Builder"
            description="Build T-Nutz extrusion and hardware orders with the exact machining options. Export JSON compatible with the automation script."
            href="/tools/tnutz"
            Icon={Package}
          />
        </div>
      </div>
    </div>
  );
}
