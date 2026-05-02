import type { Metadata } from 'next';
import PlywoodOptimizer from '@/components/tools/PlywoodOptimizer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Plywood Cut Optimizer',
  description: 'Optimize plywood cut layouts to minimize waste. Enter sheet dimensions and required pieces to get an SVG cut diagram.',
};

export default function PlywoodPage() {
  return (
    <div className="pt-24 pb-20 bg-[#faf8ff]">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-[#3c4a42] hover:text-[#006c49] transition-colors text-[14px] font-medium mb-8"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          <ArrowLeft size={16} />
          All Tools
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-2 mb-3 text-[#006c49]" style={{ fontFamily: 'monospace' }}>
            <span className="text-[14px]">/* plywood_cut_optimizer.ts */</span>
          </div>
          <h1 className="text-[48px] font-bold leading-[1.1] text-[#131b2e] mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Plywood Cut Optimizer
          </h1>
          <p className="text-[18px] leading-[1.6] text-[#3c4a42] max-w-2xl">
            Enter your sheet dimensions and the pieces you need. The optimizer uses a guillotine bin-packing algorithm to minimize waste and generate a visual cut layout.
          </p>
        </header>

        <PlywoodOptimizer />
      </div>
    </div>
  );
}
