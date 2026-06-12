import Link from 'next/link';

export const metadata = { title: "Terms of Service – LET'S GO" };

export default function TermsPage() {
  return (
    <main className="pt-24 pb-20 px-4 max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8A8A8A] hover:text-[#1A1A1A] tracking-wide uppercase mb-10 transition-colors"
      >
        ← Back
      </Link>

      <h1 className="serif text-3xl font-bold text-[#1A1A1A] mb-2">Terms of Service</h1>
      <p className="text-sm text-[#C87A53] font-medium tracking-wide mb-8">Effective June 12, 2026</p>

      <div className="space-y-6 legal-body leading-relaxed">

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Acceptance of Terms</h2>
          <p className="text-sm">
            By accessing or using <span className="font-semibold text-[#1A1A1A]">Let&rsquo;s Go Travel Journal </span> (&ldquo;the App&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, please discontinue use of the App immediately.
          </p>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Use of the App</h2>
          <div className="space-y-3 text-sm">
            <p>Let&rsquo;s Go is a personal travel journal that allows you to record, organize, and reflect on trips, dining experiences, and hotel stays. You may use the App for lawful, personal purposes only.</p>
            <p>You agree not to:</p>
            <ul className="space-y-2 list-disc list-outside pl-5 marker:text-[#C87A53]">
              <li>Use the App for any unlawful or unauthorized purpose.</li>
              <li>Upload content that is offensive, defamatory, or infringes on any third party&rsquo;s rights.</li>
              <li>Attempt to gain unauthorized access to any part of the App or its infrastructure.</li>
              <li>Interfere with or disrupt the operation of the App.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Your Account</h2>
          <p className="text-sm">
            You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately at <a href="mailto:zhenglin0619@gmail.com" className="text-[#C87A53] hover:underline">zhenglin0619@gmail.com</a> if you suspect any unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Your Content</h2>
          <p className="text-sm">
            You retain full ownership of all content you create within the App — including trip notes, photos, and journal entries. By using the App, you grant us a limited, non-exclusive license to store and display your content solely for the purpose of providing the service to you.
          </p>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Collaboration Features</h2>
          <p className="text-sm">
            The App allows you to invite other users as collaborators. You are responsible for any collaborators you invite and the access you grant them. We are not liable for any actions taken by collaborators on your account.
          </p>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Demo Mode</h2>
          <p className="text-sm">
            The App includes a Demo Mode that displays sample data for demonstration purposes. Content shown in Demo Mode is fictional and intended for illustrative use only.
          </p>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Service Availability</h2>
          <p className="text-sm">
            We strive to keep the App available at all times but do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any part of the App at any time without notice.
          </p>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Disclaimer of Warranties</h2>
          <p className="text-sm">
            The App is provided &ldquo;as is&rdquo; without warranties of any kind, either express or implied. We do not warrant that the App will be error-free, secure, or meet your specific requirements.
          </p>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Limitation of Liability</h2>
          <p className="text-sm">
            To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the App, including but not limited to loss of data or access to your account.
          </p>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Changes to Terms</h2>
          <p className="text-sm">
            We reserve the right to update these Terms at any time. Continued use of the App after changes are posted constitutes your acceptance of the revised Terms. We encourage you to review this page periodically.
          </p>
        </section>

        <section>
          <h2 className="serif text-lg font-semibold text-[#1A1A1A] mb-1.5">Contact</h2>
          <p className="text-sm">
            For any questions regarding these Terms, please contact us at <a href="mailto:zhenglin0619@gmail.com" className="text-[#C87A53] hover:underline">zhenglin0619@gmail.com</a>.
          </p>
        </section>

      </div>

      <div className="mt-14 pt-8 border-t border-[#E8E6E1] dark:border-[#333]">
        <p className="text-xs text-[#C0BAB2] text-center tracking-wide">Let&rsquo;s Go Travel Journal · All rights reserved</p>
      </div>
    </main>
  );
}
