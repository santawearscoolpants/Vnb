import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Award, BadgePercent, BookOpen, Check, Gift, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import api, { type StewardMilestone } from '../services/api';
import { getStoredStewardReferral } from '../utils/referrals';
import { useRouter } from '../context/RouterContext';

const highlights = [
  {
    icon: Users,
    title: 'Community-led growth',
    description:
      'Stewards introduce VNB to people who value African luxury, craftsmanship, and intentional style.',
  },
  {
    icon: BadgePercent,
    title: 'Real commission ledger',
    description:
      'Qualified referred purchases create tracked commission records instead of informal promises.',
  },
  {
    icon: Award,
    title: 'Milestones and recognition',
    description:
      'Top-performing stewards can unlock rewards, recognition, and ambassador review opportunities.',
  },
] as const;

const commitments = [
  'Default commission range: 10% to 15% of product subtotal on paid, verified orders.',
  'Bi-weekly payout review with a short fraud/returns hold before payment release.',
  'Referral links can be rotated or paused without losing historical performance.',
  'Course completion is part of activation so stewards represent the brand consistently.',
] as const;

const steps = [
  {
    icon: BookOpen,
    title: 'Join the waitlist',
    body: 'Tell us your background, audience, and why you fit the brand.',
  },
  {
    icon: ShieldCheck,
    title: 'Review and approval',
    body: 'We review fit, alignment, and readiness before activating a live steward account.',
  },
  {
    icon: Gift,
    title: 'Receive code and milestones',
    body: 'Approved stewards get a managed referral code, commission rate, and milestone path.',
  },
] as const;

const sectionFade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45 },
} as const;

export function StewardsPage() {
  const { navigateTo } = useRouter();
  const [loading, setLoading] = useState(false);
  const [milestones, setMilestones] = useState<StewardMilestone[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    background: '',
    message: '',
  });

  const storedReferral = getStoredStewardReferral();

  useEffect(() => {
    api
      .getActiveStewardMilestones()
      .then(setMilestones)
      .catch(() => setMilestones([]));
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await api.submitAffiliateWaitlist(formData);
      toast.success(result.message);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        location: '',
        background: '',
        message: '',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not join the VNB Steward waitlist.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pt-20 text-zinc-900">
      {/* Hero — high contrast, single focal column (matches Contact / FAQ) */}
      <section className="relative overflow-hidden bg-black py-16 text-white md:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(180, 140, 80, 0.35), transparent)',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#e8c896]">
              VNB Steward program
            </p>
            <h1 className="text-balance text-3xl font-medium leading-tight tracking-tight text-white md:text-5xl md:leading-[1.1]">
              Become a VNB Steward and grow the brand with us.
            </h1>
            <p className="mx-auto max-w-xl text-pretty text-base leading-relaxed text-white/80 md:text-lg md:leading-relaxed">
              The community layer of Vines &amp; Branches: advocates and trusted referrers who bring new customers into
              the house—with clear commissions tied to verified orders.
            </p>
            <div className="flex flex-col items-stretch justify-center gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
              <Button
                type="button"
                size="lg"
                className="rounded-none bg-white px-8 text-zinc-900 hover:bg-zinc-100"
                onClick={() => document.getElementById('steward-join-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Join the waitlist
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="rounded-none border-white/20 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white"
                onClick={() => navigateTo('account-dashboard')}
              >
                Steward dashboard
              </Button>
            </div>
          </motion.div>
        </div>

        {storedReferral && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="relative mx-auto mt-12 max-w-xl px-4 md:px-8"
          >
            <div className="rounded-sm border border-[rgba(251,191,36,0.45)] bg-zinc-900 px-5 py-4 text-left shadow-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#fcd34d]" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-white">
                    Referral on this device:{' '}
                    <span className="font-semibold text-[#fef9c3]">{storedReferral.code}</span>
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                    If you shop or join from here, steward attribution is carried into checkout.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* Program commitments — light card strip (readable; no translucent dark panel) */}
      <section className="border-b border-zinc-200 bg-white py-14 md:py-16">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <motion.div {...sectionFade} className="mb-10 text-center md:mb-12">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white">
              <ShieldCheck className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="text-xl font-medium text-zinc-900 md:text-2xl">What you can expect</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 md:text-base">
              Straightforward terms so the program stays fair for stewards and for customers.
            </p>
          </motion.div>
          <ul className="mx-auto grid max-w-3xl gap-4">
            {commitments.map((item) => (
              <motion.li
                key={item}
                {...sectionFade}
                className="flex gap-4 rounded-sm border border-zinc-200 bg-zinc-100 px-5 py-4 md:px-6 md:py-5"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="text-left text-sm leading-relaxed text-zinc-700 md:text-[15px] md:leading-relaxed">
                  {item}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why + three pillars */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <motion.div {...sectionFade} className="mb-12 max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500">Why this program exists</p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-zinc-900 md:text-3xl">
              Not influencer noise. Real stewardship.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 md:text-base md:leading-relaxed">
              Growth through trusted referrals. Every commission is tied to a verified payment and a real order—so
              performance and payouts stay defensible.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
            {highlights.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-24px' }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="flex flex-col rounded-sm border border-zinc-200 bg-white p-8 shadow-sm"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900">
                  <item.icon className="h-7 w-7" strokeWidth={1.5} aria-hidden />
                </div>
                <h3 className="text-lg font-medium text-zinc-900">{item.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — vertical timeline */}
      <section className="border-y border-zinc-200 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <motion.div {...sectionFade} className="mb-12 md:mb-16">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500">How it works</p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-zinc-900 md:text-3xl">
              From waitlist to active steward
            </h2>
          </motion.div>

          <div className="relative mx-auto max-w-2xl">
            <div className="absolute left-[21px] top-8 bottom-8 hidden w-px bg-zinc-200 md:block" aria-hidden />
            <ol className="space-y-12 md:space-y-14">
              {steps.map((step, index) => (
                <motion.li
                  key={step.title}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="relative flex gap-6 md:gap-8"
                >
                  <div className="relative z-[1] flex shrink-0 flex-col items-center md:block">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-zinc-900 text-white shadow-md ring-4 ring-white md:h-12 md:w-12">
                      <step.icon className="h-5 w-5 md:h-5 md:w-5" strokeWidth={1.5} aria-hidden />
                    </div>
                    <span className="mt-2 text-xs font-semibold text-zinc-400 md:absolute md:-left-1 md:mt-0 md:translate-x-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pb-1 pt-0.5 md:pt-1">
                    <h3 className="text-lg font-medium text-zinc-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600 md:text-[15px] md:leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Waitlist form — dedicated band, narrow readable column */}
      <section id="steward-join-form" className="scroll-mt-24 py-16 md:py-24">
        <div className="mx-auto max-w-xl px-4 md:px-8">
          <motion.div {...sectionFade} className="mb-10 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500">Apply</p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-zinc-900 md:text-3xl">
              Join the VNB Steward waitlist
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-600">
              We record your interest here. Activation follows review and approval—we will follow up by email.
            </p>
          </motion.div>

          <motion.div
            {...sectionFade}
            className="rounded-sm border border-zinc-200 bg-white p-6 shadow-sm md:p-10"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block text-left">
                  <span className="text-sm font-medium text-zinc-800">Full name *</span>
                  <input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className="mt-2 w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </label>
                <label className="block text-left">
                  <span className="text-sm font-medium text-zinc-800">Email *</span>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="mt-2 w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </label>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block text-left">
                  <span className="text-sm font-medium text-zinc-800">Phone</span>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    className="mt-2 w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </label>
                <label className="block text-left">
                  <span className="text-sm font-medium text-zinc-800">Location</span>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, country"
                    autoComplete="address-level2"
                    className="mt-2 w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </label>
              </div>

              <label className="block text-left">
                <span className="text-sm font-medium text-zinc-800">Background</span>
                <textarea
                  name="background"
                  rows={4}
                  value={formData.background}
                  onChange={handleChange}
                  placeholder="Audience, brand fit, content style, or community experience."
                  className="mt-2 w-full resize-y border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </label>

              <label className="block text-left">
                <span className="text-sm font-medium text-zinc-800">Why do you want to become a steward?</span>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Who you reach and why VNB fits your voice."
                  className="mt-2 w-full resize-y border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </label>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full rounded-none bg-black text-white hover:bg-zinc-800"
              >
                {loading ? 'Submitting…' : 'Submit application'}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Milestones */}
      <section className="border-t border-zinc-200 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <motion.div {...sectionFade} className="mb-10 max-w-2xl md:mb-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500">Milestones</p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-zinc-900 md:text-3xl">
              Progress, rewarded deliberately
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 md:text-base">
              Milestones are tied to real order data so recognition and rewards stay aligned with performance.
            </p>
          </motion.div>

          {milestones.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {milestones.map((milestone, index) => (
                <motion.article
                  key={milestone.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="flex flex-col rounded-sm border border-zinc-200 bg-zinc-50 p-6 md:p-7"
                >
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                    {milestone.measurement_window}
                  </p>
                  <h3 className="mt-3 text-lg font-medium text-zinc-900">{milestone.name}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600">{milestone.description}</p>
                  <div className="mt-6 flex flex-col gap-2 border-t border-zinc-200 pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-zinc-600">
                      {milestone.required_successful_orders} successful purchase
                      {milestone.required_successful_orders === 1 ? '' : 's'}
                    </span>
                    <span className="font-medium text-zinc-900">
                      {milestone.reward_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <motion.div
              {...sectionFade}
              className="rounded-sm border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center"
            >
              <p className="text-sm leading-relaxed text-zinc-600">
                Milestones will appear here once the steward module is configured in your Supabase project.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
