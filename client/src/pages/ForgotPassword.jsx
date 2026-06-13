import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md surface rounded-2xl p-8 animate-fade-in relative z-10 shadow-xl">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-success-100 dark:bg-success-700/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success-500" />
            </div>
            <h1 className="heading-2xl mb-2">Check your email</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              If an account exists for <strong style={{ color: 'var(--text-heading)' }}>{email}</strong>, we've sent a password reset link.
            </p>
            <Link to="/login">
              <Button variant="ghost" size="md">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="heading-2xl mb-2">Forgot password?</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-error-50 dark:bg-error-700/10 border border-error-200 dark:border-error-700/30 text-sm text-error-600 dark:text-error-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="Email" type="email" icon={Mail} placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Send Reset Link
              </Button>
            </form>

            <p className="text-center text-sm mt-6">
              <Link to="/login" className="text-primary-500 hover:text-primary-400 font-medium transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
