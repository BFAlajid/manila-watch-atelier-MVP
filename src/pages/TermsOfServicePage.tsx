import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { motion } from 'motion/react';

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl mb-8 text-white">Terms of Service</h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-neutral-400 mb-6">
              <strong>Last Updated:</strong> December 11, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">1. Agreement to Terms</h2>
              <p className="text-neutral-300 mb-4">
                By accessing and using Manila Watch Atelier's website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">2. Description of Service</h2>
              <p className="text-neutral-300 mb-4">
                Manila Watch Atelier operates as a luxury timepiece dealer based in the Philippines, specializing in:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>Sale of pre-owned luxury watches</li>
                <li>Watch authentication and verification</li>
                <li>Customer consultation and advisory services</li>
                <li>Online watch viewing and information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">3. Use License and Restrictions</h2>

              <h3 className="text-xl text-white mb-3">3.1 Permitted Use</h3>
              <p className="text-neutral-300 mb-4">
                You are granted a limited, non-exclusive, non-transferable license to:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>View and browse our watch inventory</li>
                <li>Make inquiries about available timepieces</li>
                <li>Use our contact and inquiry features</li>
              </ul>

              <h3 className="text-xl text-white mb-3">3.2 Prohibited Activities</h3>
              <p className="text-neutral-300 mb-4">
                You may not:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>Use the site for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to any portion of the site</li>
                <li>Copy, reproduce, or redistribute any content without written permission</li>
                <li>Use automated systems (bots, scrapers) to access the site</li>
                <li>Transmit viruses, malware, or other harmful code</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with the proper functioning of the website</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">4. Product Information and Pricing</h2>

              <h3 className="text-xl text-white mb-3">4.1 Product Descriptions</h3>
              <p className="text-neutral-300 mb-4">
                We strive to provide accurate descriptions and images of all watches. However:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>Colors and appearance may vary based on display settings</li>
                <li>All watches are pre-owned unless otherwise stated</li>
                <li>Condition descriptions are subjective assessments</li>
                <li>We reserve the right to correct errors in descriptions</li>
              </ul>

              <h3 className="text-xl text-white mb-3">4.2 Pricing</h3>
              <p className="text-neutral-300 mb-4">
                All prices are listed in Philippine Pesos (PHP) and are subject to change without notice. We reserve the right to:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>Modify prices at any time</li>
                <li>Correct pricing errors</li>
                <li>Refuse or cancel any order due to pricing errors</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">5. Purchase Process</h2>

              <h3 className="text-xl text-white mb-3">5.1 Inquiry and Reservation</h3>
              <p className="text-neutral-300 mb-4">
                Our website serves as a product showcase. All purchases require:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>Initial inquiry via WhatsApp or inquiry form</li>
                <li>Verification of availability</li>
                <li>Agreement on terms, pricing, and payment method</li>
                <li>Formal confirmation of purchase</li>
              </ul>

              <h3 className="text-xl text-white mb-3">5.2 Payment</h3>
              <p className="text-neutral-300 mb-4">
                Payment terms and methods will be discussed and agreed upon directly with our team. We accept various payment methods as communicated during the transaction.
              </p>

              <h3 className="text-xl text-white mb-3">5.3 Availability</h3>
              <p className="text-neutral-300 mb-4">
                All watches are subject to prior sale. We update our inventory regularly, but cannot guarantee availability until confirmed.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">6. Authentication and Condition</h2>
              <p className="text-neutral-300 mb-4">
                All watches sold by Manila Watch Atelier are:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>Guaranteed authentic</li>
                <li>Thoroughly inspected prior to sale</li>
                <li>Accompanied by condition reports as stated</li>
                <li>Sold with any documentation as specified in the listing</li>
              </ul>
              <p className="text-neutral-300 mb-4">
                We provide detailed descriptions of watch condition, including any servicing history, box and papers availability, and visible wear.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">7. Returns and Refunds</h2>
              <p className="text-neutral-300 mb-4">
                Due to the nature of luxury watch sales:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>All sales are final unless otherwise agreed in writing</li>
                <li>Returns may be considered on a case-by-case basis</li>
                <li>Watches must be in the same condition as received</li>
                <li>Return shipping and insurance are the buyer's responsibility</li>
                <li>Specific return terms will be outlined in your purchase agreement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">8. Warranty and Disclaimer</h2>

              <h3 className="text-xl text-white mb-3">8.1 Limited Warranty</h3>
              <p className="text-neutral-300 mb-4">
                Watches are sold "as-is" unless a specific warranty is provided in writing. Any manufacturer warranties are subject to the manufacturer's terms.
              </p>

              <h3 className="text-xl text-white mb-3">8.2 Disclaimer of Warranties</h3>
              <p className="text-neutral-300 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">9. Limitation of Liability</h2>
              <p className="text-neutral-300 mb-4">
                Manila Watch Atelier shall not be liable for:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of profits or business opportunities</li>
                <li>Damages exceeding the purchase price of the watch</li>
                <li>Delays or failures due to circumstances beyond our control</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">10. Intellectual Property</h2>
              <p className="text-neutral-300 mb-4">
                All content on this website, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>Text, graphics, logos, and images</li>
                <li>Software and code</li>
                <li>Watch photography and descriptions</li>
                <li>Design and layout</li>
              </ul>
              <p className="text-neutral-300 mb-4">
                is the property of Manila Watch Atelier or its content suppliers and is protected by Philippine and international copyright laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">11. Privacy</h2>
              <p className="text-neutral-300 mb-4">
                Your use of our website is also governed by our Privacy Policy. Please review our <a href="/privacy-policy" className="text-[#D4AF37] hover:underline">Privacy Policy</a> to understand our practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">12. Third-Party Services</h2>
              <p className="text-neutral-300 mb-4">
                Our website may integrate with third-party services including:
              </p>
              <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
                <li>Facebook (for video content)</li>
                <li>WhatsApp (for customer communication)</li>
                <li>Payment processors</li>
              </ul>
              <p className="text-neutral-300 mb-4">
                Use of these services is subject to their respective terms and conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">13. Governing Law</h2>
              <p className="text-neutral-300 mb-4">
                These Terms of Service are governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to its conflict of law provisions.
              </p>
              <p className="text-neutral-300 mb-4">
                Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of the Philippines.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">14. Modifications to Terms</h2>
              <p className="text-neutral-300 mb-4">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">15. Severability</h2>
              <p className="text-neutral-300 mb-4">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">16. Contact Information</h2>
              <p className="text-neutral-300 mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <p className="text-white mb-2"><strong>Manila Watch Atelier</strong></p>
                <p className="text-neutral-300 mb-2">Philippines</p>
                <p className="text-neutral-300">Via WhatsApp inquiry form on our website</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl text-white mb-4">17. Entire Agreement</h2>
              <p className="text-neutral-300 mb-4">
                These Terms of Service, together with our Privacy Policy and any purchase agreements, constitute the entire agreement between you and Manila Watch Atelier regarding use of our website and services.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </motion.div>
  );
}
