import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-white">GRAPHH</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4 max-w-xs">
              Premium cosmetics crafted with love. Discover your perfect beauty essentials.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" className="w-9 h-9 bg-gray-800 hover:bg-pink-500 rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" className="w-9 h-9 bg-gray-800 hover:bg-pink-500 rounded-lg flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" className="w-9 h-9 bg-gray-800 hover:bg-pink-500 rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" className="w-9 h-9 bg-gray-800 hover:bg-pink-500 rounded-lg flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/category/lips" className="hover:text-pink-400 transition-colors">Lips</Link></li>
              <li><Link href="/category/eyes" className="hover:text-pink-400 transition-colors">Eyes</Link></li>
              <li><Link href="/category/face" className="hover:text-pink-400 transition-colors">Face</Link></li>
              <li><Link href="/category/skincare" className="hover:text-pink-400 transition-colors">Skincare</Link></li>
              <li><Link href="/category/nails" className="hover:text-pink-400 transition-colors">Nails</Link></li>
              <li><Link href="/category/combos" className="hover:text-pink-400 transition-colors">Combos & Kits</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold mb-4">Help</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/faq" className="hover:text-pink-400 transition-colors">FAQs</Link></li>
              <li><Link href="/shipping" className="hover:text-pink-400 transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-pink-400 transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/track-order" className="hover:text-pink-400 transition-colors">Track Order</Link></li>
              <li><Link href="/contact" className="hover:text-pink-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-pink-400 transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-pink-400 transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-pink-400 transition-colors">Careers</Link></li>
              <li><Link href="/privacy" className="hover:text-pink-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-pink-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-pink-400" />
                <span>support@graphh.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-pink-400" />
                <span>+91 1800-123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-pink-400" />
                <span>Mumbai, Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-gray-800">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>We Accept:</span>
              <div className="flex gap-2 ml-2">
                <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-xs">Visa</div>
                <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-xs">MC</div>
                <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-xs">UPI</div>
                <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-xs">COD</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Secured by:</span>
              <div className="flex gap-2 ml-2">
                <div className="px-2 h-6 bg-gray-800 rounded flex items-center justify-center text-xs">🔒 SSL</div>
                <div className="px-2 h-6 bg-gray-800 rounded flex items-center justify-center text-xs">Razorpay</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <p>© 2024 Graphh Cosmetics. All rights reserved.</p>
            <p>Made with 💖 in India</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
