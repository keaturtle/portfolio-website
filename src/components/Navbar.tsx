'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/projects', label: 'Projects' },
  { href: '/tools', label: 'Tools' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ${
        scrolled || isOpen
          ? 'bg-white/80 backdrop-blur-md border-slate-200 shadow-sm'
          : 'bg-white/80 backdrop-blur-md border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16 w-full">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tighter text-slate-900"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          KEATEN TUTTLE
        </Link>

        {/* Desktop nav */}
        <div
          className="hidden md:flex items-center space-x-8"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-medium tracking-tight transition-colors ${
                isActive(link.href)
                  ? 'text-emerald-600 border-b-2 border-emerald-600 pb-1'
                  : 'text-slate-600 hover:text-emerald-500'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="hidden md:inline-flex bg-[#10b981] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#006c49] transition-all active:scale-95 duration-150"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Contact Me
          </Link>
          <button
            className="md:hidden p-2 text-slate-600 hover:text-emerald-600 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={24} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={24} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-white border-t border-slate-200"
          >
            <div className="flex flex-col px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`font-medium tracking-tight py-2 transition-colors ${
                    isActive(link.href)
                      ? 'text-emerald-600'
                      : 'text-slate-600 hover:text-emerald-500'
                  }`}
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="bg-[#10b981] text-white px-6 py-3 rounded-lg font-medium text-center hover:bg-[#006c49] transition-all"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Contact Me
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
