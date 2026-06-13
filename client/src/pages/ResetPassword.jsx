import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Lock, CheckCircle2 } from 'lucide-react';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="heading-2xl mb-2">Invalid link</h1>
          <p className="label-sm mb-4">This password reset link is missing or invalid.</p>
          <Link to="/forgot-password"><Button>Request a new link</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md surface rounded-2xl p-8 animate-fade-in shadow-xl">
        {done ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-success-100 dark:bg-success-700/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success-500" />
            </div>
            <h1 className="heading-2xl mb-2">Password reset!</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>You can now sign in with your new password.</p>
            <Link to="/login"><Button className="w-full" size="lg">Sign In</Button></Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="heading-2xl mb-2">Set new password</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Choose a strong password for your account.</p>
            </div>
            {error && <div className="mb-6 p-3 rounded-xl bg-error-50 dark:bg-error-700/10 border border-error-200 dark:border-error-700/30 text-sm text-error-600 dark:text-error-400">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="New Password" type="password" icon={Lock} placeholder="Min 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <Input label="Confirm Password" type="password" icon={Lock} placeholder="Re-enter password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
              <Button type="submit" className="w-full" size="lg" loading={loading}>Reset Password</Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
