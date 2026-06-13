import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import Button from '../components/ui/Button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    const verify = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
            <h1 className="heading-2xl mb-2">Verifying your email…</h1>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-success-100 dark:bg-success-700/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success-500" />
            </div>
            <h1 className="heading-2xl mb-2">Email verified!</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Your email has been confirmed. You're good to go.</p>
            <Link to="/dashboard"><Button size="lg">Go to Dashboard</Button></Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-error-100 dark:bg-error-700/20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-error-500" />
            </div>
            <h1 className="heading-2xl mb-2">Verification failed</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>This link may be invalid or expired.</p>
            <Link to="/login"><Button variant="ghost" size="md">Back to login</Button></Link>
          </>
        )}
      </div>
    </div>
  );
}
