import Link from 'next/link';

export const metadata = { title: "Privacy Policy | LET'S GO" };

export default function PrivacyPage() {
  return (
    <main className="pt-24 pb-20 px-4 max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8A8A8A] hover:text-[#1A1A1A] tracking-wide uppercase mb-10 transition-colors"
      >
        ← Back
      </Link>

      <h1 className="serif text-3xl font-bold text-[#1A1A1A] mb-2">Privacy Policy</h1>
      <p className="text-sm text-[#C87A53] font-medium tracking-wide mb-8">Effective June 12, 2026</p>

      <div className="space-y-6 legal-body leading-relaxed">

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Introduction</h2>
          <p className="text-sm">
            Welcome to <span className="font-semibold text-[#1A1A1A]">Let&rsquo;s Go Travel Journal</span>. We respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains what data we collect, how we use it, and the choices you have.
          </p>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Information We Collect</h2>
          <ul className="text-sm space-y-2 list-disc list-outside pl-5 marker:text-[#C87A53]">
            <li><span className="font-semibold text-[#1A1A1A]">Account information:</span> When you sign in via Google or email, we collect your email address, display name, and profile picture to create and identify your account.</li>
            <li><span className="font-semibold text-[#1A1A1A]">Journal content:</span> Trips, restaurant visits, and hotel stays you record — including titles, dates, notes, photos, and ratings — are stored and associated with your account.</li>
            <li><span className="font-semibold text-[#1A1A1A]">Collaboration data:</span> When you invite or accept collaborators, we store the relevant user IDs and email addresses to facilitate shared access.</li>
            <li><span className="font-semibold text-[#1A1A1A]">Preferences:</span> Local settings such as appearance (System, Light, or Dark mode) and language preference are stored in your browser&rsquo;s local storage and are not transmitted to our servers.</li>
          </ul>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">How We Use Your Information</h2>
          <ul className="text-sm space-y-2 list-disc list-outside pl-5 marker:text-[#C87A53]">
            <li>To authenticate you and maintain your account.</li>
            <li>To store and display your travel journal entries.</li>
            <li>To enable collaboration features between users you invite.</li>
            <li>To improve the app&rsquo;s reliability and user experience.</li>
          </ul>
          <p className="text-sm mt-3">We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Third-Party Services</h2>
          <ul className="text-sm space-y-2 list-disc list-outside pl-5 marker:text-[#C87A53]">
            <li><span className="font-semibold text-[#1A1A1A]">Supabase:</span> We use Supabase as our backend database and authentication provider. Your data is stored on Supabase&rsquo;s infrastructure. Please review <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#C87A53] hover:underline">Supabase&rsquo;s privacy policy</a> for details on their data handling practices.</li>
            <li><span className="font-semibold text-[#1A1A1A]">Google OAuth:</span> If you sign in with Google, Google shares your basic profile information with us in accordance with their <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#C87A53] hover:underline">privacy policy</a>. We do not receive your Google password.</li>
          </ul>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Data Retention</h2>
          <p className="text-sm">
            Your data is retained as long as your account is active. If you wish to delete your account and all associated data, please contact us at <a href="mailto:zhenglin0619@gmail.com" className="text-[#C87A53] hover:underline">zhenglin0619@gmail.com</a> and we will process your request within 1 week.
          </p>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Security</h2>
          <p className="text-sm">
            We take reasonable measures to protect your information, including using HTTPS for all data in transit and relying on Supabase&rsquo;s row-level security policies to ensure users can only access their own data.
          </p>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Your Rights</h2>
          <p className="text-sm">
            You have the right to access, correct, or delete the personal information we hold about you. To exercise any of these rights, please contact us at <a href="mailto:zhenglin0619@gmail.com" className="text-[#C87A53] hover:underline">zhenglin0619@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Changes to This Policy</h2>
          <p className="text-sm">
            We may update this Privacy Policy from time to time. When we do, we will update the effective date above. Continued use of the app after changes constitutes your acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Contact</h2>
          <p className="text-sm">
            If you have any questions about this Privacy Policy, please reach out at <a href="mailto:zhenglin0619@gmail.com" className="text-[#C87A53] hover:underline">zhenglin0619@gmail.com</a>.
          </p>
        </section>

      </div>

      <div className="mt-14 pt-8 border-t border-[#E8E6E1] dark:border-[#333]">
        <p className="text-xs text-[#C0BAB2] text-center tracking-wide">Let&rsquo;s Go Travel Journal · All rights reserved</p>
      </div>
    </main>
  );
}
