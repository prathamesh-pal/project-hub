// Copy lives here so it can be reviewed in one place.
// Only product statements supported by TrueHuman's site/brief are used.

export interface NavItem { id: string; label: string; href: string }
export interface Cluster { id: string; label: string; rgb: [number, number, number]; event: string }
export interface Station { id: 'identity' | 'credentials' | 'opportunities' | 'trust'; title: string; text: string }
export interface Context { id: 'recruiters' | 'digital' | 'banking'; name: string; text: string }
export interface ProfileItem { id: string; label: string; description: string }
export interface Article { id: string; title: string; href: string; date?: string; readTime?: string }
export interface Faq { q: string; a: string }
export interface FooterLink { label: string; href: string; external?: boolean }

export const SITE_URL = 'https://truehuman.id/';

export const NAV: NavItem[] = [
  { id: 'top', label: 'Home', href: '#top' },
  { id: 'manifesto', label: 'Manifesto', href: '#manifesto' },
  { id: 'recruiters', label: 'For Recruiters', href: '#recruiters' },
];

// Identity-field clusters (hero visualisation + legend).
export const CLUSTERS: Cluster[] = [
  { id: 'identity', label: 'Identity', rgb: [35, 25, 19], event: 'identity verified' },
  { id: 'credentials', label: 'Credentials', rgb: [166, 124, 30], event: 'credential added' },
  { id: 'skills', label: 'Skills', rgb: [206, 108, 28], event: 'skill recorded' },
  { id: 'achievements', label: 'Achievements', rgb: [196, 154, 0], event: 'achievement added' },
];

export const STATEMENT =
  'TrueHuman ID is your live track record.The one you can rely on. Without having to prove yourself from scratch every time, wherever you need it.';

export const STATIONS: Station[] = [
  { id: 'identity', title: 'Identity', text: 'Start with a verified human identity.' },
  { id: 'credentials', title: 'Credentials', text: 'Qualifications, skills and experience attach to it.' },
  { id: 'opportunities', title: 'Opportunities', text: 'Carry the same record into every context.' },
  { id: 'trust', title: 'Trust', text: 'Others see what you choose to share.' },
];

export const CONTEXTS: Context[] = [
  { id: 'recruiters', name: 'Professional environments', text: 'A clearer picture of the experience and qualifications behind a person, for the people hiring them.' },
  { id: 'digital', name: 'Digital services', text: 'One reusable identity for signups and verification online.' },
  { id: 'banking', name: 'Banking', text: 'A connected record to support identity across financial services.' },
];

export const PROFILE: ProfileItem[] = [
  { id: 'identity', label: 'Identity', description: 'A verified human identity at the centre of your record.' },
  { id: 'credentials', label: 'Credentials', description: 'Credentials connected to the person they belong to.' },
  { id: 'qualifications', label: 'Qualifications', description: 'Qualifications that form part of your wider story.' },
  { id: 'skills', label: 'Skills', description: 'Skills, alongside the experience behind them.' },
  { id: 'achievements', label: 'Achievements', description: 'Milestones that add context to your progress.' },
  { id: 'endorsements', label: 'Endorsements', description: 'Recognition from others, kept with the rest of your record.' },
  { id: 'experience', label: 'Professional experience', description: 'The work behind the profile, connected to everything else.' },
];

// Optional fields (date, readTime) render only when present — nothing is invented.
export const ARTICLES: Article[] = [
  { id: 'verification-post-ai', title: 'The state of verification post AI-revolution', href: SITE_URL },
];

export const FAQS: Faq[] = [
  {
    q: 'What is TrueHuman ID?',
    a: 'A universal, verifiable human identity and track record. It connects your verified identity with your credentials, qualifications, skills, achievements, endorsements and professional experience, so one record can travel with you.',
  },
  {
    q: 'How do I get a verified TrueHuman ID?',
    a: 'Start with “Get your TrueHuman ID”. TrueHuman confirms the real person behind an identity with a video call or an in-person check. The current steps are shown when you begin.',
  },
  {
    q: 'How will I use TrueHuman ID for online experiences?',
    a: 'Use the same verified identity and record wherever you’re asked to prove who you are or what you’ve done: in professional settings, digital signups and banking.',
  },
  {
    q: 'Can I choose what information to share?',
    a: 'Yes. Sharing is your choice: TrueHuman describes verification results as shared only with the employers you choose.',
  },
  {
    q: 'How is TrueHuman ID different?',
    a: 'It treats identity as more than a one-time check. Verified identity is tied to a lasting track record (credentials, skills, endorsements and experience) that you can reuse.',
  },
];

export const FOOTER_LINKS: Record<'explore' | 'legal' | 'social', FooterLink[]> = {
  explore: [
    { label: 'Home', href: '#top' },
    { label: 'Manifesto', href: '#manifesto' },
    { label: 'TrueProfile', href: '#profile' },
    { label: 'FAQs', href: '#faq' },
  ],
  legal: [
    { label: 'Privacy Policy', href: SITE_URL, external: true },
    { label: 'Security', href: SITE_URL, external: true },
  ],
  // TODO(content): replace with TrueHuman's real profile URLs.
  social: [
    { label: 'LinkedIn', href: SITE_URL, external: true },
    { label: 'X', href: SITE_URL, external: true },
    { label: 'Instagram', href: SITE_URL, external: true },
  ],
};
