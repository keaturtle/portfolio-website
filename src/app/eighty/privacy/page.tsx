import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Eighty — Privacy Policy',
  description:
    'Privacy policy for the Eighty iOS app. Everything stays on your device — no account, no cloud, no tracking.',
};

const EFFECTIVE_DATE = 'July 17, 2026';

export default function EightyPrivacyPage() {
  return (
    <div className="pt-24 pb-20 bg-[#faf8ff] min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <div
          className="text-[#006c49] text-[12px] font-semibold uppercase tracking-wider mb-4 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          <span className="w-8 h-[1px] bg-[#006c49] inline-block" />
          Eighty · iOS App
        </div>

        <h1
          className="text-4xl md:text-5xl font-bold text-[#131b2e] mb-3"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Privacy Policy
        </h1>
        <p className="text-[#6c7a71] mb-12">Effective date: {EFFECTIVE_DATE}</p>

        <Section title="The short version">
          <p>
            Eighty keeps everything on your device. There is no account, no server, no
            analytics, and no tracking. The app does not collect, transmit, sell, or share any
            personal information — because none of your data ever leaves your phone unless{' '}
            <em>you</em> choose to export it.
          </p>
        </Section>

        <Section title="What the app stores (on your device only)">
          <p>Everything you enter lives in a local database on your iPhone:</p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li>Your challenge setups (names, durations, thresholds, checklists).</li>
            <li>Your daily check-offs and which days you closed out.</li>
            <li>Optional satisfaction and mood ratings, travel-day flags, and notes.</li>
            <li>Your app settings (theme, reminder preferences).</li>
          </ul>
          <p className="mt-3">
            None of this is uploaded anywhere. There is no login and no cloud sync in this
            version.
          </p>
        </Section>

        <Section title="Notifications">
          <p>
            If you turn on reminders, Eighty schedules <strong>local</strong> notifications on
            your device (a morning “close out yesterday” nudge and an evening “unchecked items”
            nudge). These are generated on your phone. No notification is sent through us or any
            third party, and turning them off in the app (or in iOS Settings) stops them.
          </p>
        </Section>

        <Section title="Backups and exports">
          <p>
            Eighty lets you export your data to a file so you can back it up or move it to
            another device. When you tap “Back up everything” or export a single challenge,
            iOS’s standard share sheet lets you choose where that file goes (Files, AirDrop,
            email, etc.). That file goes wherever <strong>you</strong> send it. The developer
            never receives it and has no access to it.
          </p>
          <p className="mt-3">
            Restoring or importing a file reads it back into the app on your device only.
          </p>
        </Section>

        <Section title="Third parties">
          <p>
            Eighty contains no third-party advertising, analytics, or tracking SDKs. It makes no
            network requests to send your data anywhere.
          </p>
        </Section>

        <Section title="Children’s privacy">
          <p>
            Eighty does not knowingly collect any information from anyone, including children
            under 13.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If this policy changes in a future version, the updated policy will be posted at this
            same URL with a new effective date.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions? Email{' '}
            <a href="mailto:keatentuttle@gmail.com" className="text-[#006c49] underline">
              keatentuttle@gmail.com
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2
        className="text-xl font-bold text-[#131b2e] mb-3"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {title}
      </h2>
      <div className="text-[#3c4a42] leading-relaxed">{children}</div>
    </section>
  );
}
