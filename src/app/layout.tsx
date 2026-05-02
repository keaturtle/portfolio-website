import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Keaten Tuttle — Portfolio',
    template: '%s | Keaten Tuttle',
  },
  description: 'Mechanical engineer, builder, and tool maker. Explore my projects and interactive tools.',
  metadataBase: new URL('https://keatentuttle.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://keatentuttle.vercel.app',
    siteName: 'Keaten Tuttle',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="bg-background text-on-surface font-body-md antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
