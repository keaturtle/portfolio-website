import type { Metadata } from 'next';
import TnutzOrderBuilder from '@/components/tools/TnutzOrderBuilder';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'TNutz Order Builder',
  description: 'Build T-Nutz extrusion and hardware orders with exact machining options. Export JSON for use with the tnutz_order.py automation script.',
};

export default function TnutzPage() {
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
            <span className="text-[14px]">/* tnutz_order_builder */</span>
          </div>
          <h1 className="text-[48px] font-bold leading-[1.1] text-[#131b2e] mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            TNutz Order Builder
          </h1>
          <p className="text-[18px] leading-[1.6] text-[#3c4a42] max-w-2xl">
            Build your T-Nutz extrusion and hardware order list. Select SKU, length, fraction, machining options, and quantities. Export a JSON file compatible with the <code className="bg-[#eaedff] px-1.5 py-0.5 rounded text-[#006c49] font-mono text-[16px]">tnutz_order.py</code> automation script.
          </p>
        </header>

        <TnutzOrderBuilder />
      </div>
    </div>
  );
}
