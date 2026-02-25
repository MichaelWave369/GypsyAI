import Link from 'next/link';

const links = [
  { href: '/', label: 'Home' },
  { href: '/tarot', label: 'Tarot' },
  { href: '/astrology', label: 'Astrology' },
  { href: '/genekeys', label: 'Gene Keys' },
  { href: '/profile', label: 'Profile' },
  { href: '/study', label: 'Study' },
  { href: '/settings', label: 'Settings' }
];

export function Nav() {
  return <nav className="mb-8 flex flex-wrap gap-3">{links.map((link) => <Link key={link.href} href={link.href} className="rounded-md border border-gold/40 px-3 py-1 text-sm text-gold hover:bg-gold/10">{link.label}</Link>)}</nav>;
}
