import { Instagram, Facebook, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-black border-t border-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl mb-4">
              MANILA WATCH<span className="font-light text-[#D4AF37]"> ATELIER</span>
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
              Specialists in ultra-luxury timepieces from Rolex, Patek Philippe, 
              Audemars Piguet, and Cartier.
            </p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Curated by <span className="text-[#D4AF37]">Sherard W Ng</span>
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="mb-4 text-sm tracking-widest uppercase text-[#D4AF37]">Our Brands</h4>
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
              Specialists in the holy trinity of luxury watches and premium Swiss maisons.
            </p>
            <ul className="space-y-1 text-neutral-400 text-sm">
              <li>• Rolex</li>
              <li>• Patek Philippe</li>
              <li>• Audemars Piguet</li>
              <li>• Cartier</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm tracking-widest uppercase text-[#D4AF37]">
              Contact Sherard
            </h4>
            <ul className="space-y-2 text-neutral-400 text-sm">
              <li>
                <a
                  href="https://www.instagram.com/manilawatchatelier/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] transition-colors flex items-center space-x-2"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/sherard.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] transition-colors flex items-center space-x-2"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#D4AF37] transition-colors flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Messenger</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:sherard@manilawatch.com?subject=Watch Inquiry"
                  className="hover:text-[#D4AF37] transition-colors flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Inquiry</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-sm tracking-widest uppercase text-[#D4AF37]">
              Our Services
            </h4>
            <ul className="space-y-2 text-neutral-400 text-sm">
              <li>• 100% Authenticity Guarantee</li>
              <li>• 3-Month Service Warranty</li>
              <li>• Buy-Back Program</li>
              <li>• Trade-In Services</li>
              <li>• Secure Payment Options</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-neutral-500 text-sm">
            © 2025 Manila Watch Atelier. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <a
              href="https://www.instagram.com/manilawatchatelier/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-[#D4AF37] transition-colors"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.facebook.com/sherard.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-[#D4AF37] transition-colors"
              aria-label="Follow us on Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="mailto:sherard@manilawatch.com?subject=Watch Inquiry"
              className="text-neutral-400 hover:text-[#D4AF37] transition-colors"
              aria-label="Email us"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>

          {/* Legal */}
          <div className="flex items-center space-x-6 text-neutral-500 text-sm">
            <Link to="/privacy-policy" className="hover:text-[#D4AF37] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-[#D4AF37] transition-colors">
              Terms of Service
            </Link>
            <Link to="/admin" className="hover:text-[#D4AF37] transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}