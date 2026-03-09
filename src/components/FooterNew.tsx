import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '../i18n/I18nContext';
import logo from "../assets/logo.png";
import { CONTACT_EMAILS } from '../constants/contact';

export function FooterNew() {
  const { t } = useI18n();

  const helpLinks = [
    { label: t('footer.faqs'), href: '#' },
    { label: t('footer.productCare'), href: '#' },
    { label: t('footer.stores'), href: '#' },
  ];

  const servicesLinks = [
    { label: t('footer.repairs'), href: '#' },
    { label: t('footer.personalization'), href: '#' },
    { label: t('footer.artOfGifting'), href: '#' },
    { label: t('footer.downloadApps'), href: '#' },
  ];

  const aboutLinks = [
    { label: t('footer.fashionShows'), href: '#' },
    { label: t('footer.artsCulture'), href: '#' },
    { label: t('footer.laMaison'), href: '#' },
    { label: t('footer.sustainability'), href: '#' },
    { label: t('footer.latestNews'), href: '#' },
    { label: t('footer.careers'), href: '#' },
    { label: t('footer.foundation'), href: '#' },
  ];
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
            <h4 className="mb-4 text-xs tracking-wider text-black">{t('footer.help')}</h4>
            <p className="mb-3 text-xs text-zinc-700">
              {t('footer.helpText')} {' '}
              <a
                href={`mailto:${CONTACT_EMAILS.customerCare}`}
                className="underline hover:text-black"
              >
                {CONTACT_EMAILS.customerCare}
              </a>{' '}
              or by phone at{' '}
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
            <h4 className="mb-4 text-xs tracking-wider text-black">{t('footer.services')}</h4>
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
            <h4 className="mb-4 text-xs tracking-wider text-black">{t('footer.about')}</h4>
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
            <h4 className="mb-4 text-xs tracking-wider text-black">{t('footer.emailSignup')}</h4>
            <p className="mb-4 text-xs text-zinc-700">
              <a href="#" className="underline hover:text-black">
                {t('newsletter.subscribe')}
              </a>{' '}
              {t('footer.emailSignupText')}
            </p>
            <p className="text-xs text-zinc-700">
              <a href="#" className="underline hover:text-black">
                {t('footer.followUs')}
              </a>
            </p>
          </div>
        </div>

        {/* Location Selector */}
        <div className="mt-8 border-t border-zinc-200 pt-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <p className="text-xs text-zinc-700">
              {t('footer.shipTo')}{' '}
              <button className="inline-flex items-center gap-1 underline hover:text-black">
                🇺🇸 United States
              </button>
            </p>
            <div className="space-y-1 text-xs text-zinc-700 md:text-right">
              <p className="tracking-wider text-black">{t('footer.emailUs')}</p>
              <a href={`mailto:${CONTACT_EMAILS.customerCare}`} className="block underline hover:text-black">
                {CONTACT_EMAILS.customerCare}
              </a>
              <a href={`mailto:${CONTACT_EMAILS.info}`} className="block underline hover:text-black">
                {CONTACT_EMAILS.info}
              </a>
              <a href={`mailto:${CONTACT_EMAILS.investment}`} className="block underline hover:text-black">
                {CONTACT_EMAILS.investment}
              </a>
            </div>
          </div>
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
          <p className="text-xs text-zinc-500">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
