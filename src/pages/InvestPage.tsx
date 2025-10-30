import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { TrendingUp, Users, Globe, Award, ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import logo from 'figma:asset/a4eabd48a91cf2ad3f1c96be6aa7cc8c409fc025.png';

const investmentTiers = [
  {
    name: 'Seed',
    amount: '$50,000',
    equity: '2-5%',
    benefits: [
      'Quarterly financial reports',
      'Investor newsletter',
      'Exclusive product previews',
      'Annual investor meeting access'
    ]
  },
  {
    name: 'Growth',
    amount: '$250,000',
    equity: '5-10%',
    benefits: [
      'All Seed benefits',
      'Board observer seat',
      'Quarterly strategy calls',
      'VIP event invitations',
      'Product co-creation opportunities'
    ],
    featured: true
  },
  {
    name: 'Strategic',
    amount: '$1,000,000+',
    equity: '10-20%',
    benefits: [
      'All Growth benefits',
      'Board seat',
      'Monthly executive briefings',
      'Strategic planning input',
      'Global expansion partnership',
      'Licensing opportunities'
    ]
  }
];

const metrics = [
  { label: 'Revenue Growth', value: '350%', icon: TrendingUp },
  { label: 'Active Customers', value: '50K+', icon: Users },
  { label: 'Markets', value: '15', icon: Globe },
  { label: 'Awards', value: '8', icon: Award }
];

export function InvestPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Thank you for your interest! Our investment team will contact you within 48 hours.');
    setFormData({ name: '', email: '', phone: '', amount: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black py-24 text-white">
        <div className="absolute inset-0 opacity-10">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwc3RvcmV8ZW58MXx8fHwxNzYxNjk2NDM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Investment"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.img 
              src={logo} 
              alt="VNB" 
              className="mx-auto mb-8 h-16 w-auto brightness-0 invert"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
            <h1 className="mb-6">Invest in the Future of Luxury</h1>
            <p className="mx-auto mb-12 max-w-2xl text-white/80">
              Join us in building Africa's most prestigious luxury fashion brand. 
              Be part of a movement that's redefining elegance and craftsmanship.
            </p>
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90"
              onClick={() => document.getElementById('invest-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Investment Opportunities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="border-b border-zinc-200 bg-zinc-50 py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                    <metric.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="mb-1 text-black">{metric.value}</div>
                <p className="text-sm text-zinc-600">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Invest Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-black">Why Invest in VNB?</h2>
            <p className="text-zinc-600">
              A unique opportunity in Africa's growing luxury market
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Market Opportunity',
                description: 'Africa\'s luxury goods market is projected to reach $8.5 billion by 2025, with Ghana positioned as a key gateway.'
              },
              {
                title: 'Proven Track Record',
                description: '350% revenue growth year-over-year with expanding margins and a loyal customer base of over 50,000.'
              },
              {
                title: 'Unique Positioning',
                description: 'First luxury brand authentically rooted in African craftsmanship with global appeal and distribution.'
              },
              {
                title: 'Scalable Model',
                description: 'Omnichannel approach combining e-commerce, flagship stores, and strategic retail partnerships.'
              },
              {
                title: 'Strong Leadership',
                description: 'Experienced management team with backgrounds from LVMH, Kering, and leading African businesses.'
              },
              {
                title: 'Sustainability Focus',
                description: 'Ethical sourcing and production practices appeal to conscious luxury consumers worldwide.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-sm border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <h3 className="mb-3 text-black">{item.title}</h3>
                <p className="text-sm text-zinc-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Tiers */}
      <section className="bg-zinc-50 py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-black">Investment Tiers</h2>
            <p className="text-zinc-600">
              Choose the investment level that aligns with your goals
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {investmentTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-sm border bg-white p-8 shadow-sm ${
                  tier.featured ? 'border-black ring-2 ring-black' : 'border-zinc-200'
                }`}
              >
                {tier.featured && (
                  <div className="mb-4 inline-block rounded-full bg-black px-3 py-1 text-xs text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="mb-2 text-black">{tier.name}</h3>
                <div className="mb-2 text-black">{tier.amount}</div>
                <p className="mb-6 text-sm text-zinc-600">Equity: {tier.equity}</p>
                <ul className="space-y-3">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-black" />
                      <span className="text-zinc-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Form */}
      <section id="invest-form" className="py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-black">Express Your Interest</h2>
            <p className="text-zinc-600">
              Fill out the form below and our investment team will contact you
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="rounded-sm border border-zinc-200 bg-white p-8 shadow-sm"
          >
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm text-zinc-700">
                    Full Name *
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
                    Email Address *
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
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm text-zinc-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full rounded-sm border border-zinc-300 px-4 py-3 text-black outline-none transition-colors focus:border-black"
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="mb-2 block text-sm text-zinc-700">
                    Investment Interest *
                  </label>
                  <select
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    className="w-full rounded-sm border border-zinc-300 px-4 py-3 text-black outline-none transition-colors focus:border-black"
                  >
                    <option value="">Select an amount</option>
                    <option value="seed">Seed ($50,000)</option>
                    <option value="growth">Growth ($250,000)</option>
                    <option value="strategic">Strategic ($1M+)</option>
                    <option value="custom">Custom Amount</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm text-zinc-700">
                  Additional Information
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-sm border border-zinc-300 px-4 py-3 text-black outline-none transition-colors focus:border-black"
                  placeholder="Tell us about your investment background and interests..."
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-zinc-800"
                size="lg"
              >
                Submit Investment Inquiry
              </Button>
            </div>
          </motion.form>

          <p className="mt-6 text-center text-xs text-zinc-500">
            By submitting this form, you agree to be contacted by VNB regarding investment opportunities.
            All investment opportunities are subject to verification and approval.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-24 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4">Ready to Join Our Journey?</h2>
            <p className="mb-8 text-white/80">
              Partner with VNB and be part of redefining luxury in Africa and beyond.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90"
                onClick={() => document.getElementById('invest-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Download Investor Deck
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
