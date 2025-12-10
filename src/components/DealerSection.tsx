import { Facebook, MessageCircle, Instagram, Award, Shield, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import dealerImage from 'figma:asset/e23b0e4a5d033dfb8ed6611f9e7eb8086d0179ca.png';

export function DealerSection() {
  return (
    <section id="about" className="bg-neutral-950 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-sm tracking-widest text-[#D4AF37] mb-4 uppercase"
            >
              Your Watch Specialist
            </motion.p>
            
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-4xl lg:text-5xl mb-6 text-white"
            >
              Meet Sherard W Ng
            </motion.h3>
            
            <div className="space-y-4 text-neutral-300 leading-relaxed mb-8">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                With years of experience in ultra-luxury timepieces, Sherard 
                specializes exclusively in the world&apos;s most prestigious brands: 
                Rolex, Patek Philippe, Audemars Piguet, and Cartier. Each piece is 
                meticulously authenticated and verified for exceptional condition.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                Based in Manila, Manila Watch Atelier offers personalized 
                service, professional authentication, and expert guidance for 
                both new and seasoned collectors seeking investment-grade 
                timepieces.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                Whether you&apos;re acquiring your first haute horlogerie piece or 
                expanding your collection with grail watches, Sherard provides 
                trusted expertise and transparent service every step of the way.
              </motion.p>
            </div>

            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="pt-6 border-t border-neutral-800 mb-6"
            >
              <h4 className="mb-4 text-white">Exclusive Perks</h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-white">3-Month Service Warranty</p>
                    <p className="text-xs text-neutral-500">Full mechanical service coverage</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Award className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-white">Buy-Back Guaranteed*</p>
                    <p className="text-xs text-neutral-500">Investment protection program</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-white">Trade-Ins Welcome</p>
                    <p className="text-xs text-neutral-500">Upgrade your collection anytime</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-white">100% Authentic Guarantee</p>
                    <p className="text-xs text-neutral-500">Over 10 years of trusted expertise</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-4">
                *Terms and conditions apply. We are not affiliated with any brands.
              </p>
            </motion.div>

            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="pt-6 border-t border-neutral-800 mb-6"
            >
              <p className="text-sm text-neutral-300 mb-2">Payment Methods</p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Cash and bank transfers preferred for seamless transactions.
              </p>
              <p className="text-[10px] text-neutral-500 mt-1">
                *Card payments accepted. Processing fees will be shouldered by customer.
              </p>
            </motion.div>

            {/* Contact Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <motion.a
                href="https://www.instagram.com/manilawatchatelier/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#D4AF37] text-black px-6 py-3 rounded-lg hover:bg-[#F4E5B8] transition-colors inline-flex items-center space-x-2 shadow-lg"
              >
                <Instagram className="w-5 h-5" />
                <span>Follow on Instagram</span>
              </motion.a>

              <motion.a
                href="https://www.facebook.com/sherard.ng"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="border border-neutral-700 text-white px-6 py-3 rounded-lg hover:bg-neutral-900 transition-colors inline-flex items-center space-x-2 shadow"
              >
                <Facebook className="w-5 h-5" />
                <span>Connect on Facebook</span>
              </motion.a>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  window.open('https://m.me/sherard.ng', '_blank');
                }}
                className="border border-neutral-700 text-white px-6 py-3 rounded-lg hover:bg-neutral-900 transition-colors inline-flex items-center space-x-2 shadow"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Send Message</span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[3/4] bg-neutral-900 overflow-hidden shadow-2xl rounded-2xl border border-neutral-800">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
                src={dealerImage}
                alt="Sherard W Ng"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}