'use client';

import { useState } from 'react';
import { validateContactPayload, hasErrors, ValidationErrors } from '@/lib/validateContact';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

interface FormState {
  name: string;
  email: string;
  message: string;
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateContactPayload(form);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
        setErrors({});
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle size={48} className="text-[#10b981] mb-4" />
        <h3 className="text-[24px] font-semibold text-[#131b2e] mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Message sent!
        </h3>
        <p className="text-[16px] text-[#3c4a42]">
          Thanks for reaching out. I&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {status === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle size={18} />
          <span className="text-[14px]">Something went wrong. Please try again.</span>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-[14px] font-semibold text-[#131b2e] mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Your name"
          className={`w-full px-4 py-3 rounded-lg border bg-white text-[#131b2e] placeholder-[#6c7a71] focus:outline-none focus:ring-2 focus:ring-[#10b981] transition-all ${
            errors.name ? 'border-red-400' : 'border-[#bbcabf]'
          }`}
        />
        {errors.name && <p className="mt-1 text-[12px] text-red-600">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-[14px] font-semibold text-[#131b2e] mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className={`w-full px-4 py-3 rounded-lg border bg-white text-[#131b2e] placeholder-[#6c7a71] focus:outline-none focus:ring-2 focus:ring-[#10b981] transition-all ${
            errors.email ? 'border-red-400' : 'border-[#bbcabf]'
          }`}
        />
        {errors.email && <p className="mt-1 text-[12px] text-red-600">{errors.email}</p>}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-[14px] font-semibold text-[#131b2e] mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          value={form.message}
          onChange={handleChange}
          placeholder="What&apos;s on your mind?"
          className={`w-full px-4 py-3 rounded-lg border bg-white text-[#131b2e] placeholder-[#6c7a71] focus:outline-none focus:ring-2 focus:ring-[#10b981] transition-all resize-none ${
            errors.message ? 'border-red-400' : 'border-[#bbcabf]'
          }`}
        />
        {errors.message && <p className="mt-1 text-[12px] text-red-600">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 bg-[#10b981] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#006c49] transition-all shadow-[0_4px_20px_rgba(16,185,129,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {status === 'loading' ? (
          <span>Sending...</span>
        ) : (
          <>
            <Send size={18} />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
