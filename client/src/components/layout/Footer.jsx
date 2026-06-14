import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Mail } from 'lucide-react';

const T = {
  bg: '#0A0A0A',
  text: '#ffffff',
  muted: '#6B7280',
  accent: '#F59E0B',
  divider: '#1F1F1F',
  font: "'Plus Jakarta Sans', system-ui, sans-serif",
};

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Browse Services', to: '/services' },
      { label: 'Post a Service', to: '/services/create' },
      { label: 'How It Works', onClick: () => {} },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'My Bookings', to: '/my-bookings' },
      { label: 'Profile', to: '/profile' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Get Help', onClick: () => {} },
      { label: 'Privacy Policy', onClick: () => {} },
      { label: 'Terms of Service', onClick: () => {} },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ background: T.bg, fontFamily: T.font, marginTop: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 80px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
          {/* Brand column */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: T.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={16} style={{ color: T.bg }} />
              </div>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: T.text }}>
                Campus<span style={{ color: T.accent }}>Connect</span>
              </span>
            </Link>
            <p style={{ fontSize: '0.875rem', color: T.muted, lineHeight: 1.6, marginBottom: 20, maxWidth: 240 }}>
              The marketplace where university students connect to find and offer services.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[Twitter, Github, Mail].map((Icon, i) => (
                <button
                  key={i}
                  onClick={() => {}}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: 'none',
                    background: 'transparent', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: T.muted,
                    transition: 'color .2s', fontFamily: T.font,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = T.accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = T.muted; }}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 style={{
                color: T.text, fontWeight: 600, fontSize: '0.875rem',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16,
              }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {col.links.map((link) => (
                  <li key={link.label} style={{ marginBottom: 12 }}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        style={{
                          color: T.muted, fontSize: '0.875rem', textDecoration: 'none',
                          transition: 'color .2s', display: 'block',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = T.accent; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = T.muted; }}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        onClick={link.onClick}
                        style={{
                          color: T.muted, fontSize: '0.875rem', background: 'none',
                          border: 'none', padding: 0, cursor: 'pointer', fontFamily: T.font,
                          transition: 'color .2s', display: 'block', textAlign: 'left',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = T.accent; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = T.muted; }}
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: 40, paddingTop: 24, borderTop: `1px solid ${T.divider}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ fontSize: '0.8125rem', color: T.muted, margin: 0 }}>
            © {new Date().getFullYear()} CampusConnect. Built for students, by students.
          </p>
          <p style={{ fontSize: '0.8125rem', color: T.muted, margin: 0 }}>
            Made with ♥ for campus communities
          </p>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
          footer > div {
            padding: 40px 20px 32px !important;
          }
        }
      `}</style>
    </footer>
  );
}
