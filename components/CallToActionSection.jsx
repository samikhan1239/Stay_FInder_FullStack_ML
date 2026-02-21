"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-14">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              StayFinder
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Discover premium stays around the world with curated,
              comfortable travel experiences.
            </p>

            <div className="flex gap-4">
              <Link href="#" className="text-gray-500 hover:text-gray-900 transition">
                <Facebook size={18} />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900 transition">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900 transition">
                <Twitter size={18} />
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-gray-900 font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-gray-900 transition">About Us</Link></li>
              <li><Link href="#" className="hover:text-gray-900 transition">Careers</Link></li>
              <li><Link href="#" className="hover:text-gray-900 transition">Blog</Link></li>
              <li><Link href="#" className="hover:text-gray-900 transition">Press</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-gray-900 font-medium mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-gray-900 transition">Help Center</Link></li>
              <li><Link href="#" className="hover:text-gray-900 transition">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-gray-900 transition">Cancellation</Link></li>
              <li><Link href="#" className="hover:text-gray-900 transition">Safety</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-gray-900 font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-gray-900 transition">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-gray-900 transition">Terms</Link></li>
              <li><Link href="#" className="hover:text-gray-900 transition">Cookies</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} StayFinder. All rights reserved.</p>

          <div className="flex gap-6 mt-3 md:mt-0">
            <Link href="#" className="hover:text-gray-900 transition">Privacy</Link>
            <Link href="#" className="hover:text-gray-900 transition">Terms</Link>
            <Link href="#" className="hover:text-gray-900 transition">Sitemap</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}