import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import api from '../services/api';
import { CONTACT_EMAILS, CONTACT_PHONES, CONTACT_ADDRESS, BUSINESS_HOURS } from '../constants/contact';
import { useI18n } from '../i18n/I18nContext';

export function ContactPage() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.submitContact(formData);
      toast.success(t('contact.success'));
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error: any) {
      toast.error(error.message || t('contact.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const hours = [BUSINESS_HOURS.weekday, BUSINESS_HOURS.saturday, BUSINESS_HOURS.sunday];

  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      {/* Header */}
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="mb-4">{t('contact.heading')}</h1>
            <p className="text-white/80">{t('contact.subtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h2 className="mb-6 text-black">{t('contact.getInTouch')}</h2>
                <p className="text-zinc-600">{t('contact.intro')}</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-black">{t('contact.visitUs')}</h3>
                    <p className="text-zinc-600">
                      {CONTACT_ADDRESS.line1}<br />
                      {CONTACT_ADDRESS.line2}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-black">{t('contact.callUs')}</h3>
                    <p className="text-zinc-600">
                      <a href={CONTACT_PHONES.primaryHref} className="hover:text-black">{CONTACT_PHONES.primary}</a>
                      <br />
                      <a href={CONTACT_PHONES.secondaryHref} className="hover:text-black">{CONTACT_PHONES.secondary}</a>
                      <br />
                      <span className="text-xs text-zinc-400">Mon - Sat, 9AM - 6PM</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-black">{t('contact.emailUs')}</h3>
                    <p className="text-zinc-600">
                      <a href={`mailto:${CONTACT_EMAILS.info}`} className="underline hover:text-black">
                        {CONTACT_EMAILS.info}
                      </a>
                      <br />
                      <a href={`mailto:${CONTACT_EMAILS.customerCare}`} className="underline hover:text-black">
                        {CONTACT_EMAILS.customerCare}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="rounded-sm bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-black">{t('contact.businessHours')}</h3>
                <div className="space-y-2 text-sm text-zinc-600">
                  {hours.map((h) => (
                    <div key={h.days} className="flex justify-between">
                      <span>{h.days}</span>
                      <span>{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-sm bg-white p-8 shadow-sm"
            >
              <h3 className="mb-6 text-black">{t('contact.sendMessage')}</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm text-zinc-700">
                    {t('contact.fullName')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-sm border border-zinc-300 px-4 py-3 text-black outline-none transition-colors focus:border-black"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm text-zinc-700">
                    {t('contact.email')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-sm border border-zinc-300 px-4 py-3 text-black outline-none transition-colors focus:border-black"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm text-zinc-700">
                    {t('contact.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-sm border border-zinc-300 px-4 py-3 text-black outline-none transition-colors focus:border-black"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm text-zinc-700">
                    {t('contact.subject')} *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-sm border border-zinc-300 px-4 py-3 text-black outline-none transition-colors focus:border-black"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm text-zinc-700">
                    {t('contact.message')} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full rounded-sm border border-zinc-300 px-4 py-3 text-black outline-none transition-colors focus:border-black"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-zinc-800"
                  size="lg"
                  disabled={loading}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? t('contact.sending') : t('contact.send')}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
