import { useMemo, type ElementType } from 'react';
import { FileText, ShieldCheck, Accessibility, MapPinned, Store, Wrench, Sparkles, Gift, Smartphone, Mic, Palette, Building2, Leaf, Newspaper, Briefcase, HeartHandshake } from 'lucide-react';
import { useRouter } from '../context/RouterContext';

type InfoSection = {
  heading: string;
  body: string;
};

type InfoContent = {
  title: string;
  subtitle: string;
  icon: ElementType;
  sections: InfoSection[];
};

const CONTENT_BY_TOPIC: Record<string, InfoContent> = {
  terms: {
    title: 'Terms And Conditions',
    subtitle: 'The baseline rules for using VNB services and placing orders.',
    icon: FileText,
    sections: [
      {
        heading: 'Use of the platform',
        body: 'By using this website, you agree to comply with platform rules, accurate account information, and lawful usage requirements.',
      },
      {
        heading: 'Orders and payments',
        body: 'Orders are only confirmed after successful payment verification. VNB reserves the right to cancel fraudulent or high-risk transactions.',
      },
      {
        heading: 'Returns and disputes',
        body: 'Return eligibility and issue escalation follow VNB policy. Final shipping, refund, and support decisions are managed by customer care.',
      },
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    subtitle: 'How VNB collects, uses, and protects customer information.',
    icon: ShieldCheck,
    sections: [
      {
        heading: 'Data we collect',
        body: 'VNB may collect account details, order information, support messages, and analytics required for commerce operations.',
      },
      {
        heading: 'How data is used',
        body: 'Data is used for order fulfillment, payment verification, account management, service communication, and platform security.',
      },
      {
        heading: 'Data handling',
        body: 'Sensitive payment details are handled by payment providers. Access controls and role-based policies are applied in backend systems.',
      },
    ],
  },
  'legal-notices': {
    title: 'Legal Notices',
    subtitle: 'Ownership, trademarks, and usage rights related to VNB content.',
    icon: FileText,
    sections: [
      {
        heading: 'Intellectual property',
        body: 'Brand assets, copy, imagery, and product content are owned by VNB unless explicitly stated otherwise.',
      },
      {
        heading: 'Permitted use',
        body: 'Public content may be viewed for personal, non-abusive use. Reproduction or commercial reuse requires written authorization.',
      },
      {
        heading: 'Enforcement',
        body: 'Unauthorized use of brand content, fraudulent impersonation, or abuse may trigger account restrictions or legal action.',
      },
    ],
  },
  accessibility: {
    title: 'Accessibility',
    subtitle: 'VNB commitment to inclusive access across devices and user needs.',
    icon: Accessibility,
    sections: [
      {
        heading: 'Design intent',
        body: 'We aim to support readable typography, keyboard-friendly interactions, and compatible layouts across desktop and mobile.',
      },
      {
        heading: 'Known gaps',
        body: 'Some areas are still being improved, including richer semantic labels and more complete non-visual interaction support.',
      },
      {
        heading: 'Feedback',
        body: 'If you encounter accessibility blockers, contact customer care so issues can be prioritized and addressed quickly.',
      },
    ],
  },
  sitemap: {
    title: 'Sitemap',
    subtitle: 'A structured overview of the main VNB customer and account areas.',
    icon: MapPinned,
    sections: [
      {
        heading: 'Storefront',
        body: 'Home, category pages, product detail pages, cart, checkout, order confirmation, and payment callback.',
      },
      {
        heading: 'Customer account',
        body: 'Sign in, create account, dashboard, profile updates, address book, order history, and steward dashboard.',
      },
      {
        heading: 'Company pages',
        body: 'Contact, FAQ, care services, investment, VNB stewards, and legal information pages.',
      },
    ],
  },
  stores: {
    title: 'Stores',
    subtitle: 'Physical touchpoint strategy and in-person brand experience.',
    icon: Store,
    sections: [
      {
        heading: 'Current model',
        body: 'VNB currently focuses on digital-first commerce while developing selective in-person activation and showroom plans.',
      },
      {
        heading: 'Expansion',
        body: 'Future store strategy will prioritize high-trust locations aligned with premium service standards.',
      },
    ],
  },
  repairs: {
    title: 'Repairs',
    subtitle: 'Care and restoration support for selected VNB items.',
    icon: Wrench,
    sections: [
      {
        heading: 'Service scope',
        body: 'Repair support may include stitching correction, hardware replacement, and finishing restoration depending on item condition.',
      },
      {
        heading: 'How to request',
        body: 'Submit item details and photos through customer care for service eligibility and handling guidance.',
      },
    ],
  },
  personalization: {
    title: 'Personalization',
    subtitle: 'Selected custom options for gifts and premium items.',
    icon: Sparkles,
    sections: [
      {
        heading: 'Available options',
        body: 'Personalization availability varies by collection and may include initials, packaging styles, or card notes.',
      },
      {
        heading: 'Lead times',
        body: 'Customized orders can require additional processing time depending on production and quality checks.',
      },
    ],
  },
  gifting: {
    title: 'The Art Of Gifting',
    subtitle: 'Guidance for premium gifting with VNB products.',
    icon: Gift,
    sections: [
      {
        heading: 'Gift recommendations',
        body: 'Our collections include options suited for occasions, corporate gifting, and high-touch personal presents.',
      },
      {
        heading: 'Presentation',
        body: 'Gift experience quality includes packaging, message handling, and timely fulfillment.',
      },
    ],
  },
  'download-apps': {
    title: 'Download Apps',
    subtitle: 'Future mobile app availability and access.',
    icon: Smartphone,
    sections: [
      {
        heading: 'Current status',
        body: 'VNB mobile apps are planned but not publicly released at this stage.',
      },
      {
        heading: 'Early notice',
        body: 'App launch updates will be announced through official channels and newsletter communications.',
      },
    ],
  },
  'fashion-shows': {
    title: 'Fashion Shows',
    subtitle: 'Runway and presentation initiatives connected to VNB.',
    icon: Mic,
    sections: [
      {
        heading: 'Brand storytelling',
        body: 'Showcase events are intended to present craftsmanship, identity, and product direction in a structured format.',
      },
      {
        heading: 'Participation',
        body: 'Collaborations and invitations are managed case by case based on campaign strategy.',
      },
    ],
  },
  'arts-culture': {
    title: 'Arts And Culture',
    subtitle: 'Cultural partnerships and creative collaborations.',
    icon: Palette,
    sections: [
      {
        heading: 'Creative direction',
        body: 'VNB supports culture-led storytelling that respects African craft heritage and contemporary expression.',
      },
      {
        heading: 'Collaboration approach',
        body: 'Partnerships are chosen for quality alignment, long-term value, and community relevance.',
      },
    ],
  },
  'la-maison': {
    title: 'La Maison',
    subtitle: 'The brand house, values, and long-term narrative of VNB.',
    icon: Building2,
    sections: [
      {
        heading: 'What it represents',
        body: 'La Maison frames VNB as a disciplined luxury house built on taste, quality, and consistency.',
      },
      {
        heading: 'How it guides operations',
        body: 'It influences design standards, customer service expectations, and stewardship culture.',
      },
    ],
  },
  sustainability: {
    title: 'Sustainability',
    subtitle: 'Responsible production and quality-first lifecycle thinking.',
    icon: Leaf,
    sections: [
      {
        heading: 'Material and process intent',
        body: 'VNB aims to reduce waste through quality sourcing, better production controls, and product longevity.',
      },
      {
        heading: 'Roadmap',
        body: 'Sustainability reporting depth will grow as operations scale and measurement improves.',
      },
    ],
  },
  'latest-news': {
    title: 'Latest News',
    subtitle: 'Product releases, operations milestones, and official updates.',
    icon: Newspaper,
    sections: [
      {
        heading: 'Current status',
        body: 'A dedicated newsroom is being prepared. Major updates are currently shared through official social channels and direct communication.',
      },
      {
        heading: 'Coverage focus',
        body: 'Future updates will include launch notes, collection drops, and ecosystem announcements.',
      },
    ],
  },
  careers: {
    title: 'Careers',
    subtitle: 'Talent opportunities and role openings at VNB.',
    icon: Briefcase,
    sections: [
      {
        heading: 'Hiring focus',
        body: 'We prioritize product quality, operational discipline, and customer-first execution across commerce, design, and operations roles.',
      },
      {
        heading: 'How to apply',
        body: 'Openings and collaboration opportunities will be listed here as recruitment windows become active.',
      },
    ],
  },
  foundation: {
    title: 'Foundation',
    subtitle: 'Community and social-impact direction tied to the brand.',
    icon: HeartHandshake,
    sections: [
      {
        heading: 'Mission',
        body: 'The long-term foundation direction is to create measurable support for craftsmanship, youth opportunity, and culture-driven enterprise.',
      },
      {
        heading: 'Program maturity',
        body: 'Specific programs and eligibility structures will be published as governance is finalized.',
      },
    ],
  },
};

const DEFAULT_TOPIC = 'terms';

export function InfoPage() {
  const { pageParams } = useRouter();
  const topic = String(pageParams.topic || DEFAULT_TOPIC);

  const content = useMemo(() => {
    return CONTENT_BY_TOPIC[topic] || CONTENT_BY_TOPIC[DEFAULT_TOPIC];
  }, [topic]);

  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-stone-100 pt-20">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25">
              <Icon className="h-5 w-5" />
            </div>
            <h1 className="text-4xl leading-tight md:text-5xl">{content.title}</h1>
            <p className="mt-4 text-white/75">{content.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:px-8">
          {content.sections.map((section) => (
            <article key={section.heading} className="rounded-sm border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl text-black">{section.heading}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600 md:text-base">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
