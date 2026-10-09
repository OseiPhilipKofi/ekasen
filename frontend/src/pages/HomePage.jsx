import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  MessageSquare,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import api from "../lib/api";
import { fallbackContent } from "../data/fallback";
import { useApiData } from "../hooks/useApiData";
import { previewImage } from "../components/GlobalImagePreview";
import ProfileAvatar, { profileImageUrl } from "../components/ProfileAvatar";
import AutoSlider from "../components/AutoSlider";

const features = [
  {
    title: "Save with purpose",
    text: "Choose a contribution plan that fits your life and goals.",
  },
  {
    title: "See every cedi",
    text: "Follow deposits, growth, and payment history from your dashboard.",
  },
  {
    title: "Plan with confidence",
    text: "Get clear insights for your next financial decision.",
  },
];

export default function HomePage() {
  const loadContent = useCallback(
    () =>
      api
        .get("/content/home")
        .then((res) => ({ ...fallbackContent, ...res.data.content })),
    [],
  );
  const { data: content } = useApiData(loadContent, fallbackContent);
  const [query, setQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);

  const results = useMemo(
    () =>
      query
        ? new Fuse(features, { keys: ["title", "text"] })
            .search(query)
            .map(({ item }) => item)
        : features,
    [query],
  );

  const carousel = useMemo(() => {
    try {
      const raw = content.carousel;
      if (!raw || (Array.isArray(raw) && raw.length === 0)) {
        return [
          {
            icon: "star",
            title: "Save with purpose",
            desc: "Build a consistent contribution habit with a plan that fits your goals.",
          },
          {
            icon: "shield",
            title: "Clear payment records",
            desc: "Review confirmed payment references and contribution history in one place.",
          },
          {
            icon: "zap",
            title: "Member account support",
            desc: "Keep your teaching and contact details current from your profile.",
          },
        ];
      }
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return [];
    }
  }, [content.carousel]);

  const workers = useMemo(() => {
    try {
      return typeof content.workers === "string"
        ? JSON.parse(content.workers)
        : content.workers || [];
    } catch {
      return [];
    }
  }, [content.workers]);

  const sponsors = useMemo(() => {
    try {
      return typeof content.sponsors === "string"
        ? JSON.parse(content.sponsors)
        : content.sponsors || [];
    } catch {
      return [];
    }
  }, [content.sponsors]);

  const faqs = useMemo(() => {
    try {
      return typeof content.faq === "string"
        ? JSON.parse(content.faq)
        : content.faq || [];
    } catch {
      return [];
    }
  }, [content.faq]);

  const getIcon = (iconName) => {
    const icons = {
      star: <Sparkles size={40} className="carousel-icon" />,
      shield: <ShieldCheck size={40} className="carousel-icon" />,
      zap: <CircleDollarSign size={40} className="carousel-icon" />,
      user: <Users size={40} className="carousel-icon" />,
      message: <MessageSquare size={40} className="carousel-icon" />,
    };
    return (
      icons[iconName] || <MessageSquare size={40} className="carousel-icon" />
    );
  };

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
            <span>Member account</span>
            <strong>Payment history</strong>
            <small>Clear records at a glance</small>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <span>
          <ShieldCheck /> Secure by design
        </span>
        <span>
          <Users /> Built for educators
        </span>
        <span>
          <WalletCards /> Paystack payments
        </span>
        <span>
          <LockKeyhole /> Protected records
        </span>
      </section>

      {carousel.length > 0 && (
        <section className="section carousel-section">
          <div className="section-heading slider-heading">
            <div>
              <span className="eyebrow">Member priorities</span>
              <h2>Designed around teachers.</h2>
            </div>
          </div>
          <AutoSlider label="TiFund member benefits" className="benefit-slider">
              {carousel.map((slide, i) => (
                <motion.article
                  key={i}
                  className="carousel-slide"
                  whileHover={{ y: -4 }}
                >
                  <div className="carousel-slide-media">
                    <div className="carousel-slide-visual">
                      <ProfileAvatar
                        src={slide.image}
                        alt={slide.title || "Service"}
                        size={150}
                        onClick={() => {
                          const imageUrl = profileImageUrl(slide.image);
                          if (imageUrl) previewImage(imageUrl);
                        }}
                      />
                      <div className="carousel-slide-icon">
                        {getIcon(slide.icon || "message")}
                      </div>
                    </div>
                  </div>
                  <h3 className="carousel-slide-title">{slide.title}</h3>
                  <p className="carousel-slide-description">{slide.desc}</p>
                </motion.article>
              ))}
          </AutoSlider>
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
          <div className="section-heading centered-heading">
            <h2>Meet our team</h2>
            <p>Dedicated professionals managing your wealth.</p>
          </div>
          <div className="worker-grid">
            <AutoSlider label="TiFund team" className="team-slider">
              {workers.map((w, i) => (
              <article key={i} className="carousel-slide worker-member-card">
                <div className="carousel-slide-media">
                  <div className="carousel-slide-visual">
                    <ProfileAvatar
                      src={w.img}
                      alt={w.name || "Team member"}
                      size={150}
                      onClick={() => {
                        const imageUrl = profileImageUrl(w.img);
                        if (imageUrl) previewImage(imageUrl);
                      }}
                    />
                  </div>
                </div>
                <strong className="worker-member-name">{w.name}</strong>
                <p className="worker-member-description">{w.role}</p>
                {w.bio && <p className="worker-member-bio">{w.bio}</p>}
              </article>
              ))}
            </AutoSlider>
          </div>
        </section>
      )}

      {sponsors.length > 0 && (
        <section className="section sponsors-section">
          <div className="section-heading centered-heading">
            <span className="eyebrow">Our network</span>
            <h2>Sponsors and partners</h2>
            <p>Organizations supporting our work with teachers.</p>
          </div>
          <AutoSlider label="TiFund sponsors and partners" className="sponsor-slider">
            {sponsors.map((sponsor, i) => (
              <article className="sponsor-card" key={`${sponsor.name}-${i}`}>
                <div className="sponsor-logo">
                  {sponsor.image ? (
                    <ProfileAvatar
                      src={sponsor.image}
                      alt={`${sponsor.name} logo`}
                      size="100%"
                      square
                      fallbackIcon={Building2}
                    />
                  ) : (
                    <Building2 size={32} aria-hidden="true" />
                  )}
                </div>
                <div>
                  <h3>{sponsor.name}</h3>
                  {sponsor.description && <p>{sponsor.description}</p>}
                </div>
              </article>
            ))}
          </AutoSlider>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="section">
          <div className="section-heading centered-heading">
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="faq-container">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <div
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="faq-item-trigger"
                >
                  <span>{faq.q}</span>
                  {activeFaq === i ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="faq-item-answer"
                    >
                      <p>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
