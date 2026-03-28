import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { products, categories } from './data/products';

const API_URL = 'https://bot.affidev.com/app/plans';

function formatRupiah(amount) {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

/* ── Product Modal ── */
function ProductModal({ product, onClose }) {
  const [plans, setPlans]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter_game: product.title }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.result) throw new Error(json.message || 'Gagal memuat data');
      setPlans(json.data || []);
    } catch (e) {
      setError(e.message || 'Gagal memuat data produk. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [product.title]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={handleBackdrop}>
      <div className="modal-box" role="dialog" aria-modal="true">
        {/* Drag handle (visible on mobile) */}
        <div className="modal-drag-handle" aria-hidden="true" />
        {/* Header */}
        <div className="modal-header">
          <div className="modal-product-info">
            <ProductImage src={product.image} title={product.title} category={product.category} className="modal-product-img" />
            <div>
              <div className="modal-product-category">{product.category}</div>
              <div className="modal-product-title">{product.title}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {loading && (
            <div className="modal-loading">
              <div className="spinner" />
              <p>Memuat paket tersedia…</p>
            </div>
          )}

          {error && !loading && (
            <div className="modal-error">
              <p>⚠️ {error}</p>
              <button className="btn-retry" onClick={fetchPlans}>Coba Lagi</button>
            </div>
          )}

          {!loading && !error && plans.length === 0 && (
            <div className="modal-empty-state">
              <p>😕 Belum ada paket tersedia saat ini.</p>
            </div>
          )}

          {!loading && !error && plans.length > 0 && (
            <div className="plans-list">
              {[...plans].sort((a, b) => (a.status === 'empty') - (b.status === 'empty')).map((plan) => {
                const isEmpty  = plan.status === 'empty';
                const price    = Math.round(plan.price.basic * 1.5);
                return (
                  <div key={plan.code} className={`plan-item${isEmpty ? ' plan-empty' : ''}`}>
                    <div className="plan-left">
                      <div className="plan-name">{plan.name}</div>
                      <div className="plan-price">{formatRupiah(price)}</div>
                    </div>
                    <div className="plan-right">
                      {isEmpty ? (
                        <span className="plan-status-empty">Kosong</span>
                      ) : (
                        <a
                          className="plan-order-btn"
                          href={waLink(`Halo, saya ingin order *${product.title}* — ${plan.name} seharga ${formatRupiah(price)}`)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          🛒 Order
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const WA_NUMBER = '6289509952003';

function waLink(msg = '') {
  return `https://wa.me/${WA_NUMBER}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
}

/* ── Floating WhatsApp Button ── */
function FloatingWA() {
  return (
    <a
      className="floating-wa"
      href={waLink('Halo, saya ingin tanya produk premium!')}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span className="floating-wa-label">Chat Sekarang</span>
    </a>
  );
}



/* ── Product image with fallback ── */
const CATEGORY_COLORS = {
  Streaming: 'linear-gradient(135deg,#1e3a5f,#0d2137)',
  Creative:  'linear-gradient(135deg,#2d1b69,#1e1040)',
  AI:        'linear-gradient(135deg,#064e3b,#022c22)',
  Music:     'linear-gradient(135deg,#1a3300,#0f2000)',
  Utility:   'linear-gradient(135deg,#1c1917,#0c0a09)',
};

function ProductImage({ src, title, category, className }) {
  const [failed, setFailed] = useState(false);
  const initial = title ? title.charAt(0).toUpperCase() : '?';
  const bg = CATEGORY_COLORS[category] || 'linear-gradient(135deg,#1e1b4b,#1e3a5f)';

  if (failed) {
    return (
      <div className={`product-img-placeholder${className ? ' ' + className : ''}`} style={{ background: bg }}>
        <span>{initial}</span>
      </div>
    );
  }
  return (
    <img
      className={`product-img${className ? ' ' + className : ''}`}
      src={src}
      alt={title}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

/* ── Navbar ── */
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav className="navbar" style={scrolled ? { background: 'rgba(15,12,26,0.97)' } : {}}>
      <div className="navbar-logo">🛍️ AppStore Premium</div>
      <ul className={`navbar-nav${menuOpen ? ' open' : ''}`}>
        <li><a href="#hero"       onClick={() => scrollTo('hero')}>Beranda</a></li>
        <li><a href="#products"   onClick={() => scrollTo('products')}>Produk</a></li>
        <li><a href="#about"      onClick={() => scrollTo('about')}>Tentang</a></li>
        <li><a href="#contact"    onClick={() => scrollTo('contact')}>Kontak</a></li>
        <li>
          <a className="navbar-cta" href={waLink('Halo, saya ingin order produk premium!')} target="_blank" rel="noreferrer">
            Order Sekarang
          </a>
        </li>
      </ul>
      <div className={`navbar-hamburger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
        <span /><span /><span />
      </div>
    </nav>
  );
}

/* ── Hero ── */
function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-bg" />
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />
      <div className="hero-content">
        <div className="hero-text">
          <div className="section-badge">✨ Terpercaya & Bergaransi</div>
          <h1>Dapatkan Akun Premium{'\n'}Harga Terjangkau</h1>
          <p>
            Nikmati ribuan konten hiburan dan aplikasi premium tanpa batas
            dengan harga yang sangat terjangkau. Garansi aktif &amp; terpercaya!
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>
              🎯 Lihat Produk
            </button>
            <a className="btn-secondary" href={waLink('Halo, saya ingin bertanya tentang produk premium!')} target="_blank" rel="noreferrer">
              💬 Hubungi Kami
            </a>
          </div>
        </div>
        <div className="hero-stats">
          {[
            { icon: '👥', num: '500+', label: 'Pelanggan Puas' },
            { icon: '📦', num: '19+', label: 'Produk Premium' },
            { icon: '🕐', num: '24/7', label: 'Support Aktif' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <span className="stat-icon">{s.icon}</span>
              <div>
                <div className="stat-number">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Quick Actions (mobile-first) ── */
function QuickActions() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="quick-actions" aria-label="Navigasi cepat">
      <div className="quick-actions-grid">
        <button type="button" className="qa-card" onClick={() => scrollTo('products')}>
          <span className="qa-icon">🛒</span>
          <div>
            <div className="qa-label">Lihat Produk</div>
            <div className="qa-desc">19+ koleksi terbaru</div>
          </div>
        </button>
        <button type="button" className="qa-card" onClick={() => scrollTo('about')}>
          <span className="qa-icon">✨</span>
          <div>
            <div className="qa-label">Keunggulan</div>
            <div className="qa-desc">Garansi & cepat</div>
          </div>
        </button>
        <a className="qa-card" href={waLink('Halo, saya ingin konsultasi produk premium!')} target="_blank" rel="noreferrer">
          <span className="qa-icon">💬</span>
          <div>
            <div className="qa-label">Chat Admin</div>
            <div className="qa-desc">Respons kilat 24/7</div>
          </div>
        </a>
      </div>
    </div>
  );
}

/* ── Features ── */
const FEATURES = [
  { icon: '✅', title: 'Garansi Aktif', desc: 'Setiap produk dijamin aktif. Jika ada masalah, kami siap ganti rugi segera.' },
  { icon: '⚡', title: 'Proses Cepat', desc: 'Pengiriman akun dalam hitungan menit setelah pembayaran dikonfirmasi.' },
  { icon: '💰', title: 'Harga Terjangkau', desc: 'Harga terbaik di pasaran dengan kualitas premium yang tidak mengecewakan.' },
  { icon: '🔒', title: 'Aman & Terpercaya', desc: 'Ribuan pelanggan puas membuktikan keamanan dan kepercayaan layanan kami.' },
];

function Features() {
  return (
    <section id="about" className="section-full features-bg">
      <div className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="section-title">
          <div className="section-badge">🌟 Keunggulan Kami</div>
          <h2>Mengapa Memilih Kami?</h2>
          <p>Kami berkomitmen memberikan pengalaman belanja terbaik dengan layanan profesional dan terpercaya.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <div className="feature-card-text">
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Products ── */
function Products() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = products.filter(p => {
    const matchCategory = activeCategory === 'Semua' || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <section id="products" className="section-full products-bg">
      <div className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="section-title">
          <div className="section-badge">🏆 Koleksi Kami</div>
          <h2>Produk Premium Kami</h2>
          <p>Pilih dari berbagai aplikasi dan layanan streaming premium favoritmu dengan harga terbaik.</p>
        </div>

        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Cari produk"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')} aria-label="Hapus pencarian">✕</button>
          )}
        </div>

        <div className="category-filter">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-btn${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="products-grid">
          {filtered.length === 0 && (
            <div className="products-empty">
              <span>😕</span>
              <p>Produk tidak ditemukan</p>
            </div>
          )}
          {filtered.map(product => (
            <div key={product.id} className="product-card" onClick={() => setSelectedProduct(product)}>
              <div className="product-img-wrapper">
                <ProductImage src={product.image} title={product.title} category={product.category} />
                {product.badge && (
                  <span className={`product-badge badge-${product.badge.toLowerCase()}`}>
                    {product.badge}
                  </span>
                )}
              </div>
                <div className="product-info">
                  <div className="product-category">{product.category}</div>
                  <div className="product-title">{product.title}</div>
                  <div className="product-subtext">Tap untuk lihat detail & harga</div>
                  <button className="product-order-btn">
                    🏷️ Lihat Harga
                  </button>
                </div>
              </div>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </section>
  );
}

/* ── Testimonials ── */
const TESTIMONIALS = [
  {
    name: 'Budi Santoso',
    role: 'Content Creator',
    avatar: 'BS',
    stars: 5,
    text: 'Sudah 6 bulan langganan Netflix dan Spotify di sini. Harganya jauh lebih murah dari official, prosesnya cepat banget, dan akun selalu aktif! Sangat recommended!',
  },
  {
    name: 'Siti Rahma',
    role: 'Graphic Designer',
    avatar: 'SR',
    stars: 5,
    text: 'Canva Pro dan CapCut Pro beli di sini, kualitas top! Respon admin juga cepat, kalau ada kendala langsung diselesaikan. Terpercaya banget!',
  },
  {
    name: 'Rizki Pratama',
    role: 'Mahasiswa',
    avatar: 'RP',
    stars: 5,
    text: 'ChatGPT Plus harganya terjangkau banget dibanding beli langsung. Akunnya aktif full fitur, ga ada kendala sama sekali. Bakal repeat order terus!',
  },
];

function Testimonials() {
  return (
    <section id="contact" className="section-full testimonials-bg">
      <div className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="section-title">
          <div className="section-badge">💬 Testimoni</div>
          <h2>Kata Pelanggan Kami</h2>
          <p>Ribuan pelanggan telah mempercayakan kebutuhan akun premium mereka kepada kami.</p>
        </div>
        <div className="testimonials-grid" aria-label="Testimoni pelanggan, bisa digeser ke kiri atau kanan">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="testimonial-card">
              <div className="testimonial-stars">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} className="star-filled">★</span>
                ))}
              </div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="scroll-hint" aria-hidden="true">← Geser untuk lihat lebih →</p>
      </div>
    </section>
  );
}

/* ── CTA Banner ── */
function CTABanner() {
  return (
    <div className="cta-banner">
      <div className="cta-banner-content">
        <h2>Siap Upgrade ke Premium? 🚀</h2>
        <p>Hubungi kami sekarang dan dapatkan akun premium impianmu dengan harga terjangkau!</p>
        <a
          className="btn-primary"
          href={waLink('Halo, saya ingin tanya produk premium!')}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'inline-flex' }}
        >
          💬 Chat WhatsApp Sekarang
        </a>
      </div>
    </div>
  );
}

/* ── Footer ── */
function Footer() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <span className="footer-logo">🛍️ AppStore Premium</span>
          <p>Solusi terpercaya untuk mendapatkan akun premium berbagai aplikasi dan layanan streaming dengan harga terjangkau dan bergaransi.</p>
        </div>
        <div className="footer-col">
          <h4>Tautan Cepat</h4>
          <ul>
            <li><a href="#hero"     onClick={() => scrollTo('hero')}>Beranda</a></li>
            <li><a href="#products" onClick={() => scrollTo('products')}>Produk</a></li>
            <li><a href="#about"    onClick={() => scrollTo('about')}>Tentang Kami</a></li>
            <li><a href="#contact"  onClick={() => scrollTo('contact')}>Kontak</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Hubungi Kami</h4>
          <div className="footer-contact-item">
            📱 <a href={waLink()} target="_blank" rel="noreferrer">WhatsApp: +62 895-0995-2003</a>
          </div>
          <div className="footer-contact-item">
            ✉️ <a href="mailto:mail@affidev.com">mail@affidev.com</a>
          </div>
          <div className="footer-contact-item">
            🕐 Layanan 24/7
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {year} AppStore Premium. Semua hak dilindungi.</p>
        <div className="footer-bottom-links">
          <a href="#">Kebijakan Privasi</a>
          <a href="#">Syarat & Ketentuan</a>
        </div>
      </div>
    </footer>
  );
}

/* ── App Root ── */
export default function App() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handler = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <QuickActions />
        <Features />
        <Products />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
      <FloatingWA />
      {showTop && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Kembali ke atas"
        >
          ↑
        </button>
      )}
    </>
  );
}
