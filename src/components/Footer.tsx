import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-slate-50 border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-8 py-12 w-full gap-8">
        {/* Brand */}
        <div className="text-center md:text-left">
          <div className="font-mono text-emerald-500 font-bold text-lg mb-2">
            KEATEN TUTTLE
          </div>
          <p
            className="text-sm uppercase tracking-widest text-slate-500"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            © {currentYear} Keaten Tuttle. Built with precision.
          </p>
        </div>

        {/* Links */}
        <div
          className="flex flex-wrap justify-center gap-8 text-sm uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          <a
            href="https://github.com/keatentuttle"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 underline decoration-2 underline-offset-4 transition-all"
          >
            <Github size={16} />
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/keatentuttle"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 underline decoration-2 underline-offset-4 transition-all"
          >
            <Linkedin size={16} />
            LinkedIn
          </a>
          <Link
            href="/tools"
            className="text-slate-500 hover:text-emerald-500 underline decoration-2 underline-offset-4 transition-all"
          >
            Tools
          </Link>
          <Link
            href="/projects"
            className="text-slate-500 hover:text-emerald-500 underline decoration-2 underline-offset-4 transition-all"
          >
            Projects
          </Link>
        </div>
      </div>
    </footer>
  );
}
