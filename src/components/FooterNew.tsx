import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '../i18n/I18nContext';
import { useRouter } from '../context/RouterContext';
import logo from "../assets/logo.png";
import { CONTACT_EMAILS } from '../constants/contact';

export function FooterNew() {
  const { t } = useI18n();
  const { navigateTo } = useRouter();

  const helpLinks: { label: string; page?: string }[] = [
    { label: t('footer.faqs'), page: 'faq' },
    { label: t('footer.productCare'), page: 'care-services' },
    { label: t('footer.stores') },
  ];

  const servicesLinks = [
    { label: t('footer.repairs') },
    { label: t('footer.personalization') },
    { label: t('footer.artOfGifting') },
    { label: t('footer.downloadApps') },
  ];

  const aboutLinks = [
    { label: t('footer.fashionShows') },
    { label: t('footer.artsCulture') },
    { label: t('footer.laMaison') },
    { label: t('footer.sustainability') },
    { label: t('footer.latestNews') },
    { label: t('footer.careers') },
    { label: t('footer.foundation') },
  ];

  const legalLinks = [
    { label: 'Sitemap' },
    { label: 'Legal Notices' },
    { label: 'Privacy Policy' },
    { label: 'Accessibility' },
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
              <button
                type="button"
                onClick={() => toast.info('Live chat will be available soon.')}
                className="underline hover:text-black"
              >
                chat with us
              </button>
              .
            </p>
            <ul className="space-y-2">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => link.page ? navigateTo(link.page) : toast.info('This page will be available soon.')}
                    className="text-left text-xs text-zinc-700 transition-colors hover:text-black"
                  >
                    {link.label}
                  </button>
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
                  <button
                    type="button"
                    onClick={() => toast.info('This service will be available soon.')}
                    className="text-left text-xs text-zinc-700 transition-colors hover:text-black"
                  >
                    {link.label}
                  </button>
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
                  <button
                    type="button"
                    onClick={() => toast.info('This page will be available soon.')}
                    className="text-left text-xs text-zinc-700 transition-colors hover:text-black"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* EMAIL AND SMS SIGN-UP Section */}
          <div>
            <h4 className="mb-4 text-xs tracking-wider text-black">{t('footer.emailSignup')}</h4>
            <p className="mb-4 text-xs text-zinc-700">
              <button
                type="button"
                onClick={() => toast.info('Email/SMS sign-up details coming soon.')}
                className="underline hover:text-black"
              >
                {t('newsletter.subscribe')}
              </button>{' '}
              {t('footer.emailSignupText')}
            </p>
            <p className="text-xs text-zinc-700">
              <button
                type="button"
                onClick={() => toast.info('Social channels will be linked soon.')}
                className="underline hover:text-black"
              >
                {t('footer.followUs')}
              </button>
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
          {legalLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => toast.info('Legal information pages will be available soon.')}
              className="text-xs text-zinc-600 transition-colors hover:text-black"
            >
              {link.label}
            </button>
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
