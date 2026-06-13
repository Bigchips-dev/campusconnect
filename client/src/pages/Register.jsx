import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, Lock, User, Sparkles, Search, Briefcase } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', roles: ['SEEKER'],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleRole = (role) => {
    setForm((prev) => {
      const has = prev.roles.includes(role);
      let roles;
      if (has) {
        roles = prev.roles.filter((r) => r !== role);
        if (roles.length === 0) roles = [role === 'SEEKER' ? 'PROVIDER' : 'SEEKER'];
      } else {
        roles = [...prev.roles, role];
      }
      return { ...prev, roles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    const names = form.fullName.trim().split(/\s+/);
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || firstName;

    if (!firstName) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      await register({ firstName, lastName, email: form.email, password: form.password, roles: form.roles });
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-secondary-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md surface rounded-2xl p-8 animate-fade-in relative z-10 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="heading-2xl mb-1">Create your account</h1>
          <p className="label-sm">Join CampusConnect today</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-error-50 dark:bg-error-700/10 border border-error-200 dark:border-error-700/30 text-sm text-error-600 dark:text-error-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" icon={User} placeholder="John Doe" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <Input label="Email" type="email" icon={Mail} placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" icon={Lock} placeholder="Min 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Input label="Confirm Password" type="password" icon={Lock} placeholder="Re-enter password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />

          {/* Role selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-heading)' }}>I want to…</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => toggleRole('SEEKER')}
                className={[
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer',
                  form.roles.includes('SEEKER')
                    ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-500 text-primary-600 dark:text-primary-300'
                    : 'border-[var(--border-default)] hover:border-[var(--border-strong)]',
                ].join(' ')}
                style={!form.roles.includes('SEEKER') ? { color: 'var(--text-muted)' } : undefined}
              >
                <Search className="w-6 h-6" />
                Find Services
              </button>
              <button
                type="button"
                onClick={() => toggleRole('PROVIDER')}
                className={[
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer',
                  form.roles.includes('PROVIDER')
                    ? 'bg-secondary-50 dark:bg-secondary-950/30 border-secondary-500 text-secondary-600 dark:text-secondary-300'
                    : 'border-[var(--border-default)] hover:border-[var(--border-strong)]',
                ].join(' ')}
                style={!form.roles.includes('PROVIDER') ? { color: 'var(--text-muted)' } : undefined}
              >
                <Briefcase className="w-6 h-6" />
                Offer Services
              </button>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>You can select both!</p>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 hover:text-primary-400 font-semibold transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
