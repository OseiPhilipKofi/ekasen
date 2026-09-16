import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Fuse from 'fuse.js'
import api from '../lib/api'
import { fallbackContent } from '../data/fallback'
import { useApiData } from '../hooks/useApiData'

const features = [
  {
    title: 'Save with purpose',
    text: 'Choose a contribution plan that fits your life and goals.'
  },
  {
    title: 'See every cedi',
    text: 'Follow deposits, growth, and payment history from your dashboard.'
  },
  {
    title: 'Plan with confidence',
    text: 'Get clear insights for your next financial decision.'
  }
]

export default function HomePage() {
  const loadContent = useCallback(() =>
    api.get('/content/home').then((res) => ({ ...fallbackContent, ...res.data.content })),
    []
  )
  const { data: content } = useApiData(loadContent, fallbackContent)
  const [query, setQuery] = useState('')
  const [activeFaq, setActiveFaq] = useState(null)

  const results = useMemo(() =>
    query
      ? new Fuse(features, { keys: ['title', 'text'] }).search(query).map(({ item }) => item)
      : features,
    [query]
  )

  const carousel = useMemo(() => {
    try {
      const raw = content.carousel
      if (!raw || (Array.isArray(raw) && raw.length === 0)) {
        return [
          { icon: 'star', title: 'Excellent Service', desc: 'TiFund has helped me save consistently for my retirement.' },
          { icon: 'shield', title: 'Very Secure', desc: 'I feel safe knowing my identity documents are protected.' },
          { icon: 'zap', title: 'Great Interface', desc: 'The dashboard makes it so easy to track my contributions.' },
        ]
      }
      return typeof raw === 'string' ? JSON.parse(raw) : raw
    } catch {
      return []
    }
  }, [content.carousel])

  const workers = useMemo(() => {
    try {
      return typeof content.workers === 'string'
        ? JSON.parse(content.workers)
        : content.workers || []
    } catch {
      return []
    }
  }, [content.workers])

  const faqs = useMemo(() => {
    try {
      return typeof content.faq === 'string'
        ? JSON.parse(content.faq)
        : content.faq || []
    } catch {
      return []
    }
  }, [content.faq])

  const getIcon = (iconName) => {
    const icons = {
      star: <Sparkles size={40} className="carousel-icon" />,
      shield: <ShieldCheck size={40} className="carousel-icon" />,
      zap: <CircleDollarSign size={40} className="carousel-icon" />,
      user: <Users size={40} className="carousel-icon" />,
      message: <MessageSquare size={40} className="carousel-icon" />,
    }
    return icons[iconName] || <MessageSquare size={40} className="carousel-icon" />
  }

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={15} /> Made for teachers in Ghana
          </span>
          <h1>{content.hero_title}</h1>
          <p>{content.hero_text}</p>
          <div className="hero-actions">
            <Link className="button primary" to="/plans">
              Explore plans <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" to="/about">
              How TiFund works
            </Link>
          </div>
          <div className="hero-stat">{content.stats}</div>
        </div>

        <div className="hero-art">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-card">
            <CircleDollarSign size={28} />
            <span>Portfolio value</span>
            <strong>GH₵ 24,580.00</strong>
            <small>+12.8% this year</small>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <span><ShieldCheck /> Secure by design</span>
        <span><Users /> Built for educators</span>
        <span><WalletCards /> Paystack payments</span>
        <span><LockKeyhole /> Protected records</span>
      </section>

      {carousel.length > 0 && (
        <section className="section carousel-section">
          <div
            className="carousel-container"
            style={{ overflow: 'hidden', position: 'relative', padding: '2rem 0' }}
          >
            <motion.div
              animate={{ x: 0 }}
              className="carousel-track"
              style={{ display: 'flex', gap: '2rem', width: 'max-content' }}
            >
              {carousel.map((slide, i) => (
                <div
                  key={i}
                  className="carousel-slide"
                  style={{
                    width: '300px',
                    background: '#f9f9f9',
                    padding: '2rem 1.5rem',
                    borderRadius: '1rem',
                    border: '1px solid #eee',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ marginBottom: '1rem', color: '#6366f1', display: 'flex', justifyContent: 'center' }}>
                    {getIcon(slide.icon || 'message')}
                  </div>
                  <h3 style={{ marginBottom: '0.5rem' }}>{slide.title}</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{slide.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">One clear platform</span>
            <h2>Everything you need to stay on track</h2>
          </div>
          <div className="search-box">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search features"
            />
          </div>
        </div>

        <div className="feature-grid">
          {results.map((item, index) => (
            <motion.article
              whileHover={{ y: -5 }}
              className="feature-card"
              key={item.title}
            >
              <div className={`icon-box icon-${index}`}>
                <CheckCircle2 size={20} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <Link to="/plans">
                Learn more <ArrowRight size={15} />
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      {workers.length > 0 && (
        <section className="section">
          <div className="section-heading" style={{ textAlign: 'center' }}>
            <h2>Meet our team</h2>
            <p>Dedicated professionals managing your wealth.</p>
          </div>
          <div
            className="worker-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              marginTop: '2rem'
            }}
          >
            {workers.map((w, i) => (
              <div
                key={i}
                className="worker-card"
                style={{ textAlign: 'center', padding: '1rem', borderRadius: '1rem', border: '1px solid #eee' }}
              >
                <img
                  src={w.img ? `/api/${w.img}` : '/assets/avatar.png'}
                  alt={w.name}
                  style={{ width: '100px', height: '100px', minWidth: '100px', minHeight: '100px',borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }}
                />
                <strong>{w.name}</strong>
                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>{w.role}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="section">
          <div className="section-heading" style={{ textAlign: 'center' }}>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div
            className="faq-container"
            style={{ maxWidth: '700px', margin: '2rem auto' }}
          >
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="faq-item"
                style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}
              >
                <div
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  <span>{faq.q}</span>
                  {activeFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
