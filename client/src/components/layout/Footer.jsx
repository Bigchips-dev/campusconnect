import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Mail } from 'lucide-react';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Browse Services', to: '/services' },
      { label: 'Post a Service', to: '/services/create' },
      { label: 'How It Works', to: '/#how-it-works' },
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
      { label: 'Help Center', to: '#' },
      { label: 'Privacy Policy', to: '#' },
      { label: 'Terms of Service', to: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      className="border-t mt-auto text-slate-300"
      style={{
        backgroundColor: '#0D0A1E',
        borderColor: '#1E1838',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-md shadow-primary-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Campus<span className="text-primary-400">Connect</span>
              </span>
            </Link>
            <p className="text-sm mb-5 text-slate-400">
              The marketplace where university students connect to find and offer services.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: '#' },
                { icon: Github, href: '#' },
                { icon: Mail, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="p-2 rounded-lg transition-colors hover:bg-navy-900 text-slate-400 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold mb-3 text-white">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm transition-colors text-slate-400 hover:text-secondary-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: '#1E1838' }}
        >
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} CampusConnect. Built for students, by students.
          </p>
          <p className="text-xs text-slate-500">
            Made with 💜 for campus communities
          </p>
        </div>
      </div>
    </footer>
  );
}
