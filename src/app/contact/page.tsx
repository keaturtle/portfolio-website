import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import { Mail, Github, Linkedin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Keaten Tuttle for engineering collaborations, freelance projects, or opportunities.',
};

export default function ContactPage() {
  return (
    <div className="pt-24 pb-20 bg-[#faf8ff]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left — info */}
          <div>
            <div className="text-[#006c49] text-[12px] font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <span className="w-8 h-[1px] bg-[#006c49] inline-block" />
              Get In Touch
            </div>
            <h1 className="text-[48px] font-bold leading-[1.1] text-[#131b2e] mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Let&apos;s Work Together
            </h1>
            <p className="text-[18px] leading-[1.6] text-[#3c4a42] mb-12">
              Whether you have an engineering challenge, a project idea, or just want to connect — I&apos;d love to hear from you.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#adedd3] rounded-lg flex items-center justify-center text-[#10b981] shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6c7a71]">Email</p>
                  <p className="text-[16px] text-[#131b2e]">keaten@example.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#adedd3] rounded-lg flex items-center justify-center text-[#10b981] shrink-0">
                  <Github size={20} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6c7a71]">GitHub</p>
                  <a href="https://github.com/keatentuttle" target="_blank" rel="noopener noreferrer" className="text-[16px] text-[#006c49] hover:underline">
                    github.com/keatentuttle
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#adedd3] rounded-lg flex items-center justify-center text-[#10b981] shrink-0">
                  <Linkedin size={20} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6c7a71]">LinkedIn</p>
                  <a href="https://linkedin.com/in/keatentuttle" target="_blank" rel="noopener noreferrer" className="text-[16px] text-[#006c49] hover:underline">
                    linkedin.com/in/keatentuttle
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-white p-8 rounded-xl border border-[#bbcabf] shadow-sm">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
