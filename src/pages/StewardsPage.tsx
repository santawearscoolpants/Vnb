import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Award, BadgePercent, BookOpen, Gift, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import api, { type StewardMilestone } from '../services/api';
import { getStoredStewardReferral } from '../utils/referrals';
import { useRouter } from '../context/RouterContext';

const highlights = [
  {
    icon: Users,
    title: 'Community-led growth',
    description: 'Stewards introduce VNB to people who value African luxury, craftsmanship, and intentional style.',
  },
  {
    icon: BadgePercent,
    title: 'Real commission ledger',
    description: 'Qualified referred purchases create tracked commission records instead of informal promises.',
  },
  {
    icon: Award,
    title: 'Milestones and recognition',
    description: 'Top-performing stewards can unlock rewards, recognition, and ambassador review opportunities.',
  },
];

const commitments = [
  'Default commission range: 10% to 15% of product subtotal on paid, verified orders.',
  'Bi-weekly payout review with a short fraud/returns hold before payment release.',
  'Referral links can be rotated or paused without losing historical performance.',
  'Course completion is part of activation so stewards represent the brand consistently.',
];

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
    api.getActiveStewardMilestones()
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
    } catch (error: any) {
      toast.error(error.message || 'Could not join the VNB Steward waitlist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 pt-20 text-zinc-900">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(196,156,91,0.28),_transparent_32%),linear-gradient(135deg,_#0d0d0d,_#171513_55%,_#352618)] py-24 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.06)_45%,transparent_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 md:px-8 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-amber-200/80">VNB Affiliate Community Program</p>
            <h1 className="max-w-2xl text-4xl font-medium leading-tight md:text-6xl">
              Become a VNB Steward and grow the brand with us.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 md:text-lg">
              This is the community layer of Vines & Branches: disciplined advocates, tasteful storytellers, and
              trusted referrers who bring new customers into the house.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                type="button"
                size="lg"
                className="rounded-none bg-white px-8 text-black hover:bg-white/90"
                onClick={() => document.getElementById('steward-join-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Join The Waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="rounded-none border-white/30 bg-transparent px-8 text-white hover:bg-white/10"
                onClick={() => navigateTo('account-dashboard')}
              >
                Steward Dashboard
              </Button>
            </div>

            {storedReferral && (
              <div className="mt-8 max-w-xl rounded-sm border border-amber-200/30 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-amber-100">
                  Referral captured: <span className="font-medium text-white">{storedReferral.code}</span>
                </p>
                <p className="mt-1 text-sm text-white/70">
                  If you shop or join from this device, that steward attribution will be carried into checkout.
                </p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-sm border border-white/10 bg-white/8 p-6 backdrop-blur"
          >
            <div className="flex items-center gap-3 text-amber-200">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-sm uppercase tracking-[0.3em]">Program commitments</p>
            </div>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-white/80">
              {commitments.map((item) => (
                <li key={item} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Why this program exists</p>
              <h2 className="mt-3 text-3xl font-medium text-black md:text-4xl">Not influencer noise. Real stewardship.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-zinc-600">
              The program is designed for trusted referral growth. Every commission is tied to a verified payment attempt
              and a real order, so performance, payouts, and rewards stay defensible.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {highlights.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-sm border border-zinc-200 bg-white p-7 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-600">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Activation model</p>
            <h2 className="mt-3 text-3xl font-medium text-black md:text-4xl">How VNB Stewards are onboarded</h2>
            <div className="mt-8 space-y-6">
              {[
                { icon: BookOpen, title: '1. Join the waitlist', body: 'Tell us your background, audience, and why you fit the brand.' },
                { icon: ShieldCheck, title: '2. Review and approval', body: 'We review fit, alignment, and readiness before activating a live steward account.' },
                { icon: Gift, title: '3. Receive code and milestones', body: 'Approved stewards get a managed referral code, commission rate, and milestone path.' },
              ].map((step) => (
                <div key={step.title} className="flex gap-4">
                  <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-black">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-zinc-600">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-sm border border-zinc-200 bg-stone-50 p-8 shadow-sm">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Apply now</p>
              <h3 className="mt-3 text-2xl font-medium text-black">Join the VNB Steward waitlist</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                This form records interest now. Steward activation still happens after review and approval.
              </p>
            </div>

            <form id="steward-join-form" onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm text-zinc-700">
                  Full name *
                  <input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-none border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-black"
                  />
                </label>
                <label className="block text-sm text-zinc-700">
                  Email *
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-none border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-black"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm text-zinc-700">
                  Phone
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-none border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-black"
                  />
                </label>
                <label className="block text-sm text-zinc-700">
                  Location
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, country"
                    className="mt-2 w-full rounded-none border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-black"
                  />
                </label>
              </div>

              <label className="block text-sm text-zinc-700">
                Background
                <textarea
                  name="background"
                  rows={4}
                  value={formData.background}
                  onChange={handleChange}
                  placeholder="Tell us about your audience, brand fit, content style, or community experience."
                  className="mt-2 w-full rounded-none border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-black"
                />
              </label>

              <label className="block text-sm text-zinc-700">
                Why do you want to become a steward?
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Share the kind of customers you reach and why VNB aligns with your voice."
                  className="mt-2 w-full rounded-none border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-black"
                />
              </label>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full rounded-none bg-black text-white hover:bg-zinc-800"
              >
                {loading ? 'Submitting...' : 'Join The Waitlist'}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Milestones</p>
              <h2 className="mt-3 text-3xl font-medium text-black md:text-4xl">Progress is rewarded deliberately.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-zinc-600">
              Milestones are data-driven so recognition, free products, or ambassador review can be issued from a real ledger.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {milestones.length > 0 ? milestones.map((milestone) => (
              <div key={milestone.id} className="rounded-sm border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{milestone.measurement_window}</p>
                <h3 className="mt-3 text-xl font-medium text-black">{milestone.name}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-600">{milestone.description}</p>
                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 text-sm">
                  <span className="text-zinc-500">{milestone.required_successful_orders} successful purchases</span>
                  <span className="font-medium text-black">{milestone.reward_type.replace('_', ' ')}</span>
                </div>
              </div>
            )) : (
              <div className="rounded-sm border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600 lg:col-span-3">
                Milestones will appear here once the affiliate module is live in your Supabase project.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
