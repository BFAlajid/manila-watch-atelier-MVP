import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { motion } from 'motion/react';

export default function PrivacyPolicyPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white"
    >
      <Header />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl mb-8 text-white">Privacy Policy</h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-neutral-400 mb-6">
              <strong>Last Updated:</strong> December 11, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">1. Introduction</h2>
              <p className="text-neutral-300 mb-4">
                Manila Watch Atelier ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">2. Information We Collect</h2>

              <h3 className="text-xl text-white mb-3">2.1 Personal Information</h3>
              <p className="text-neutral-300 mb-4">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>Make an inquiry about our watches</li>
                <li>Contact us via WhatsApp or inquiry forms</li>
                <li>Subscribe to our notifications or updates</li>
                <li>Participate in customer feedback or surveys</li>
              </ul>
              <p className="text-neutral-300 mb-4">
                This information may include: name, email address, phone number, and any other information you choose to provide.
              </p>

              <h3 className="text-xl text-white mb-3">2.2 Automatically Collected Information</h3>
              <p className="text-neutral-300 mb-4">
                When you visit our website, we automatically collect certain information about your device, including:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>Browser type and version</li>
                <li>IP address</li>
                <li>Device identifiers</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referring website addresses</li>
              </ul>

              <h3 className="text-xl text-white mb-3">2.3 Cookies and Tracking Technologies</h3>
              <p className="text-neutral-300 mb-4">
                We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-neutral-300 mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>To respond to your inquiries and provide customer service</li>
                <li>To process and manage your watch purchases or reservations</li>
                <li>To send you marketing communications (with your consent)</li>
                <li>To improve our website and services</li>
                <li>To detect and prevent fraud and security incidents</li>
                <li>To comply with legal obligations</li>
                <li>To analyze website usage and trends</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-neutral-300 mb-4">
                We do not sell your personal information. We may share your information in the following situations:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li><strong>Service Providers:</strong> We may share your information with third-party service providers who perform services on our behalf (e.g., payment processors, shipping partners)</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or in response to valid requests by public authorities</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred</li>
                <li><strong>With Your Consent:</strong> We may disclose your information for any other purpose with your consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">5. Data Security</h2>
              <p className="text-neutral-300 mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">6. Data Retention</h2>
              <p className="text-neutral-300 mb-4">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">7. Your Rights</h2>
              <p className="text-neutral-300 mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another organization</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
              </ul>
              <p className="text-neutral-300 mb-4">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">8. Third-Party Services</h2>
              <p className="text-neutral-300 mb-4">
                Our website may contain links to third-party websites and services, including:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>Facebook (for video content)</li>
                <li>WhatsApp (for customer communication)</li>
                <li>Payment processors</li>
              </ul>
              <p className="text-neutral-300 mb-4">
                We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">9. Children's Privacy</h2>
              <p className="text-neutral-300 mb-4">
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">10. International Data Transfers</h2>
              <p className="text-neutral-300 mb-4">
                Your information may be transferred to and maintained on computers located outside of your jurisdiction where data protection laws may differ. By using our services, you consent to this transfer.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-neutral-300 mb-4">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">12. Contact Us</h2>
              <p className="text-neutral-300 mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <p className="text-white mb-2"><strong>Manila Watch Atelier</strong></p>
                <p className="text-neutral-300 mb-2">Philippines</p>
                <p className="text-neutral-300">Via WhatsApp inquiry form on our website</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">13. Philippine Data Privacy Act Compliance</h2>
              <p className="text-neutral-300 mb-4">
                Manila Watch Atelier complies with the Data Privacy Act of 2012 (Republic Act No. 10173) of the Philippines. We are committed to protecting your personal information in accordance with Philippine data privacy laws.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </motion.div>
  );
}
