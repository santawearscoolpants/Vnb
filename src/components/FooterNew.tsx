import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import logo from "../assets/logo.png";

const helpLinks = [
  { label: 'FAQs', href: '#' },
  { label: 'Product Care', href: '#' },
  { label: 'Stores', href: '#' }
];

const servicesLinks = [
  { label: 'Repairs', href: '#' },
  { label: 'Personalization', href: '#' },
  { label: 'Art of Gifting', href: '#' },
  { label: 'Download our Apps', href: '#' }
];

const aboutLinks = [
  { label: 'Fashion Shows', href: '#' },
  { label: 'Arts & Culture', href: '#' },
  { label: 'La Maison', href: '#' },
  { label: 'Sustainability', href: '#' },
  { label: 'Latest News', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Foundation Vines & Branches', href: '#' }
];

const legalLinks = [
  { label: 'Sitemap', href: '#' },
  { label: 'Legal Notices', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'California Supply Chains Act', href: '#' },
  { label: 'Your Privacy Choices', href: '#' },
  { label: 'Accessibility', href: '#' }
];

export function FooterNew() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Successfully subscribed to our newsletter!');
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* HELP Section */}
          <div>
            <h4 className="mb-4 text-xs tracking-wider text-black">HELP</h4>
            <p className="mb-3 text-xs text-zinc-700">
              Our Client Advisors are available to assist you by phone at{' '}
              <a href="tel:+18668848866" className="underline hover:text-black">
                +1 866 VUITTON
              </a>
              , or you may also{' '}
              <a href="#" className="underline hover:text-black">
                chat with us
              </a>
              .
            </p>
            <ul className="space-y-2">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs text-zinc-700 transition-colors hover:text-black"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* SERVICES Section */}
          <div>
            <h4 className="mb-4 text-xs tracking-wider text-black">SERVICES</h4>
            <ul className="space-y-2">
              {servicesLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs text-zinc-700 transition-colors hover:text-black"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ABOUT Section */}
          <div>
            <h4 className="mb-4 text-xs tracking-wider text-black">ABOUT VINES & BRANCHES</h4>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs text-zinc-700 transition-colors hover:text-black"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* EMAIL AND SMS SIGN-UP Section */}
          <div>
            <h4 className="mb-4 text-xs tracking-wider text-black">EMAIL AND SMS SIGN-UP</h4>
            <p className="mb-4 text-xs text-zinc-700">
              <a href="#" className="underline hover:text-black">
                Subscribe
              </a>{' '}
              for exclusive email and SMS updates and receive the latest news from Vines & Branches,
              including new arrivals and exclusive collections.
            </p>
            <p className="text-xs text-zinc-700">
              <a href="#" className="underline hover:text-black">
                Follow Us
              </a>
            </p>
          </div>
        </div>

        {/* Location Selector */}
        <div className="mt-8 border-t border-zinc-200 pt-8">
          <p className="text-xs text-zinc-700">
            Ship to:{' '}
            <button className="inline-flex items-center gap-1 underline hover:text-black">
              🇺🇸 United States
            </button>
          </p>
        </div>

        {/* Bottom Legal Links */}
        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-200 pt-8">
          {legalLinks.map((link, index) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs text-zinc-600 transition-colors hover:text-black"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Logo and Copyright */}
        <div className="mt-8 text-center">
          <img src={logo} alt="Vines & Branches" className="mx-auto mb-4 h-8 w-auto" />
          <p className="text-xs text-zinc-500">© Vines & Branches 2025. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}