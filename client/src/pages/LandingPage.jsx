import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Check,
  CircleDot,
  Factory,
  Globe2,
  Leaf,
  Menu,
  Network,
  PackageCheck,
  Recycle,
  Route,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
  Zap,
} from 'lucide-react';
import './LandingPage.css';

const navItems = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Platform', href: '#platform' },
  { label: 'Impact', href: '#impact' },
  { label: 'About', href: '#about' },
];

const stakeholders = [
  {
    icon: Truck,
    eyebrow: '01 / COLLECTION',
    title: 'Collectors',
    copy: 'Move recyclable materials into the right hands with less friction.',
    color: 'mint',
  },
  {
    icon: Boxes,
    eyebrow: '02 / COORDINATION',
    title: 'Aggregators',
    copy: 'Organize supply, relationships, and operations from one place.',
    color: 'blue',
  },
  {
    icon: Factory,
    eyebrow: '03 / TRANSFORMATION',
    title: 'Recyclers',
    copy: 'Access reliable material networks built for the next life of waste.',
    color: 'orange',
  },
];

const features = [
  { icon: Network, title: 'Smart connections', copy: 'Find the right partners across every stage of the recycling journey.' },
  { icon: PackageCheck, title: 'Material visibility', copy: 'Bring clarity to material movement, availability, and handoffs.' },
  { icon: Route, title: 'Connected supply chain', copy: 'Coordinate a stronger, more transparent path from collection to recycling.' },
  { icon: Zap, title: 'Digital operations', copy: 'Replace scattered coordination with a focused operating layer.' },
  { icon: ShieldCheck, title: 'Trusted network', copy: 'Build dependable business relationships within the ecosystem.' },
  { icon: Leaf, title: 'Sustainable impact', copy: 'Make better recycling outcomes possible through better connections.' },
];

const processSteps = [
  { number: '01', label: 'Collect', copy: 'Gather recyclable materials', icon: Truck },
  { number: '02', label: 'Aggregate', copy: 'Sort and organize at scale', icon: Boxes },
  { number: '03', label: 'Recycle', copy: 'Transform material into value', icon: Recycle },
  { number: '04', label: 'Create impact', copy: 'Keep resources in circulation', icon: Globe2 },
];

function LogoMark({ light = false }) {
  return (
    <span className={`logo-mark${light ? ' logo-mark-light' : ''}`} aria-hidden="true">
      <span className="logo-orbit logo-orbit-one" />
      <span className="logo-orbit logo-orbit-two" />
      <Recycle size={18} strokeWidth={2.5} />
    </span>
  );
}

function SectionLabel({ children, light = false }) {
  return <p className={`section-label${light ? ' section-label-light' : ''}`}><span />{children}</p>;
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing-page">
      <header className={`landing-nav${scrolled ? ' landing-nav-scrolled' : ''}`}>
        <div className="landing-container nav-inner">
          <Link to="/" className="brand" onClick={closeMenu}>
            <LogoMark />
            <span className="brand-copy"><strong>Kabadiwala</strong><small>Connect</small></span>
          </Link>
          <nav className={`nav-links${menuOpen ? ' nav-links-open' : ''}`}>
            {navItems.map((item) => <a key={item.href} href={item.href} onClick={closeMenu}>{item.label}</a>)}
            <div className="mobile-nav-actions">
              <Link to="/login" className="button button-outline" onClick={closeMenu}>Sign in</Link>
              <Link to="/register" className="button button-primary" onClick={closeMenu}>Get started <ArrowUpRight size={16} /></Link>
            </div>
          </nav>
          <div className="nav-actions">
            <Link to="/login" className="button button-ghost">Sign in</Link>
            <Link to="/register" className="button button-primary">Get started <ArrowUpRight size={16} /></Link>
          </div>
          <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-grid" />
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="landing-container hero-layout">
            <div className="hero-copy">
              <div className="announcement"><span className="pulse-dot" /> A digital layer for the circular economy <ArrowRight size={14} /></div>
              <h1>Recycling works<br /><em>better together.</em></h1>
              <p className="hero-description">Kabadiwala Connect brings collectors, aggregators, and recyclers together on one intelligent platform—making the journey from waste to value more visible, efficient, and impactful.</p>
              <div className="hero-actions">
                <Link to="/register" className="button button-primary button-large">Build your network <ArrowUpRight size={18} /></Link>
                <a href="#how-it-works" className="text-link">See how it works <ArrowDown size={16} /></a>
              </div>
              <div className="hero-proof"><div className="proof-avatars"><span>RK</span><span>AM</span><span>PS</span><span>+</span></div><p><strong>For every link in the chain</strong><br />One connected ecosystem</p></div>
            </div>
            <div className="ecosystem-visual" aria-label="Recycling supply chain visualization">
              <div className="visual-orbit visual-orbit-outer" />
              <div className="visual-orbit visual-orbit-inner" />
              <div className="visual-line visual-line-one" /><div className="visual-line visual-line-two" /><div className="visual-line visual-line-three" />
              <div className="visual-core"><div className="core-icon"><Recycle size={33} /></div><span>CONNECTED<br />ECOSYSTEM</span></div>
              <div className="ecosystem-node node-collector"><div className="node-icon"><Truck size={20} /></div><div><small>01</small><strong>Collector</strong></div></div>
              <div className="ecosystem-node node-aggregator"><div className="node-icon"><Boxes size={20} /></div><div><small>02</small><strong>Aggregator</strong></div></div>
              <div className="ecosystem-node node-recycler"><div className="node-icon"><Factory size={20} /></div><div><small>03</small><strong>Recycler</strong></div></div>
              <div className="floating-chip chip-material"><CircleDot size={13} /> MATERIAL FLOW <b>●</b></div>
              <div className="floating-chip chip-circular"><Leaf size={14} /> CIRCULAR BY DESIGN</div>
            </div>
          </div>
          <div className="hero-scroll"><span>Scroll to explore</span><div /></div>
        </section>

        <section className="trust-strip">
          <div className="landing-container trust-inner"><span>BUILT FOR A MORE CONNECTED</span><div className="trust-line" /><span>RECYCLING ECONOMY</span><div className="trust-pill"><Sparkles size={14} /> DIGITAL-FIRST</div><div className="trust-pill"><Globe2 size={14} /> INDIA & BEYOND</div></div>
        </section>

        <section className="platform-section section-space" id="platform">
          <div className="landing-container">
            <div className="section-heading split-heading"><div><SectionLabel>THE PLATFORM</SectionLabel><h2>One platform.<br /><em>Many possibilities.</em></h2></div><p>Every stakeholder has a role to play in a circular economy. We make the connections between them simpler, stronger, and more transparent.</p></div>
            <div className="stakeholder-grid">{stakeholders.map(({ icon: Icon, eyebrow, title, copy, color }, index) => <article className={`stakeholder-card card-${color}`} key={title}><div className="card-top"><span>{eyebrow}</span><ArrowUpRight size={18} /></div><div className="stakeholder-icon"><Icon size={25} /></div><h3>{title}</h3><p>{copy}</p><div className="card-index">0{index + 1}</div></article>)}</div>
          </div>
        </section>

        <section className="process-section section-space" id="how-it-works">
          <div className="landing-container">
            <div className="section-heading centered-heading"><SectionLabel>HOW IT WORKS</SectionLabel><h2>From collection to <em>circularity.</em></h2><p>A clearer path for materials, people, and progress.</p></div>
            <div className="process-flow">{processSteps.map(({ number, label, copy, icon: Icon }, index) => <div className="process-item" key={number}><div className="process-number">{number}</div><div className="process-icon"><Icon size={23} /></div><h3>{label}</h3><p>{copy}</p>{index < processSteps.length - 1 && <ArrowRight className="process-arrow" size={20} />}</div>)}</div>
          </div>
        </section>

        <section className="features-section section-space">
          <div className="landing-container">
            <div className="section-heading split-heading"><div><SectionLabel>WHAT YOU CAN DO</SectionLabel><h2>The operating layer<br />for <em>better recycling.</em></h2></div><p>Less chasing. More clarity. Kabadiwala Connect helps teams spend less time coordinating and more time moving materials forward.</p></div>
            <div className="features-grid">{features.map(({ icon: Icon, title, copy }) => <article className="feature-card" key={title}><div className="feature-icon"><Icon size={20} /></div><h3>{title}</h3><p>{copy}</p><ArrowUpRight className="feature-arrow" size={17} /></article>)}</div>
          </div>
        </section>

        <section className="about-section section-space" id="about">
          <div className="landing-container about-layout"><div className="about-art"><div className="about-art-card"><div className="art-header"><span className="art-dot" /><span className="art-dot" /><span className="art-dot" /><small>NETWORK / LIVE VIEW</small></div><div className="art-network"><div className="network-line network-line-a" /><div className="network-line network-line-b" /><div className="network-line network-line-c" /><span className="network-node network-node-a"><Truck size={15} /></span><span className="network-node network-node-b"><Boxes size={15} /></span><span className="network-node network-node-c"><Factory size={15} /></span><span className="network-node network-node-d"><Recycle size={15} /></span><div className="network-center"><Recycle size={23} /></div></div><div className="art-footer"><span><b>24</b> active links</span><span className="live-status"><i /> syncing now</span></div></div><div className="art-badge"><Leaf size={18} /><span><b>Waste is a resource</b><br />when the system works.</span></div></div><div className="about-copy"><SectionLabel>WHY KABADIWALA CONNECT</SectionLabel><h2>Make every connection<br /><em>count.</em></h2><p>Traditional recycling networks can be fragmented, manual, and hard to see. We are building the connective tissue that helps materials and businesses move with more confidence.</p><ul className="check-list"><li><Check size={16} /> Replace fragmented communication</li><li><Check size={16} /> Create visibility across material flows</li><li><Check size={16} /> Build trusted business relationships</li></ul><Link to="/register" className="text-link text-link-dark">Join the network <ArrowRight size={16} /></Link></div></div>
        </section>

        <section className="impact-section section-space" id="impact">
          <div className="impact-pattern" /><div className="landing-container impact-layout"><div><SectionLabel light>THE BIGGER PICTURE</SectionLabel><h2>Small connections.<br /><em>Bigger impact.</em></h2><p>When the chain works together, recyclable materials get a better chance at their next life. That is how a more sustainable future gets built—one connection at a time.</p><Link to="/register" className="button button-light">Start your journey <ArrowUpRight size={17} /></Link></div><div className="impact-orbit"><div className="impact-ring ring-one" /><div className="impact-ring ring-two" /><div className="impact-center"><Recycle size={42} /><span>KEEP IT<br />CIRCULAR</span></div><span className="impact-label label-one"><Leaf size={15} /> LESS WASTE</span><span className="impact-label label-two"><Network size={15} /> MORE CONNECTION</span><span className="impact-label label-three"><Globe2 size={15} /> SHARED FUTURE</span></div></div>
        </section>

        <section className="cta-section section-space"><div className="landing-container cta-inner"><SectionLabel>READY WHEN YOU ARE</SectionLabel><h2>Build a smarter recycling<br /><em>network with us.</em></h2><p>Join the people moving the circular economy forward.</p><div className="cta-actions"><Link to="/register" className="button button-primary button-large">Create an account <ArrowUpRight size={18} /></Link><Link to="/login" className="button button-outline button-large">Sign in to your account</Link></div></div></section>
      </main>

      <footer className="landing-footer"><div className="landing-container footer-main"><div className="footer-brand"><Link to="/" className="brand"><LogoMark light /><span className="brand-copy"><strong>Kabadiwala</strong><small>Connect</small></span></Link><p>Connecting the recycling supply chain for a smarter, more sustainable future.</p></div><div className="footer-links"><div><span>Explore</span>{navItems.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</div><div><span>Account</span><Link to="/login">Sign in</Link><Link to="/register">Create account</Link></div></div></div><div className="landing-container footer-bottom"><span>© 2026 Kabadiwala Connect. All rights reserved.</span><span>Designed for a circular future <Leaf size={14} /></span></div></footer>
    </div>
  );
}
