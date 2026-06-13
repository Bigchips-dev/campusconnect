import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';

const statusVariant = {
  PENDING: 'warning', ACCEPTED: 'info', REJECTED: 'danger', COMPLETED: 'success', CANCELLED: 'default',
};

export default function MyBookings() {
  const { user } = useAuth();
  const [role, setRole] = useState('seeker');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/bookings/my?role=${role}`);
      setBookings(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [role]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
      <p className="text-surface-200/60 mb-6">Track your service bookings</p>

      {/* Role toggle */}
      <div className="flex gap-2 mb-8">
        {['seeker', 'provider'].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              role === r
                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                : 'glass text-surface-200/70 hover:text-white'
            }`}
          >
            {r === 'seeker' ? '🔍 As Seeker' : '💼 As Provider'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 glass rounded-2xl animate-pulse" />)}
        </div>
      ) : bookings.length === 0 ? (
        <Card hover={false} className="text-center py-16">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">No bookings here</h3>
          <p className="text-surface-200/60">
            {role === 'seeker' ? 'Browse services and make your first booking!' : 'Bookings from seekers will appear here.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} hover={false}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar
                    name={role === 'seeker'
                      ? `${booking.service?.provider?.firstName} ${booking.service?.provider?.lastName}`
                      : `${booking.seeker?.firstName} ${booking.seeker?.lastName}`
                    }
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{booking.service?.title}</p>
                    <p className="text-sm text-surface-200/50">
                      {role === 'seeker'
                        ? `Provider: ${booking.service?.provider?.firstName} ${booking.service?.provider?.lastName}`
                        : `Seeker: ${booking.seeker?.firstName} ${booking.seeker?.lastName}`
                      }
                    </p>
                    {booking.message && (
                      <p className="text-xs text-surface-200/40 mt-1 italic">"{booking.message}"</p>
                    )}
                    <p className="text-xs text-surface-200/30 mt-1">
                      {new Date(booking.createdAt).toLocaleDateString()}
                      {booking.scheduledAt && ` · Scheduled: ${new Date(booking.scheduledAt).toLocaleString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
                  {role === 'seeker' && booking.status === 'PENDING' && (
                    <Button size="sm" variant="danger" onClick={() => updateStatus(booking.id, 'CANCELLED')}>
                      Cancel
                    </Button>
                  )}
                  {role === 'provider' && booking.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="accent" onClick={() => updateStatus(booking.id, 'ACCEPTED')}>Accept</Button>
                      <Button size="sm" variant="danger" onClick={() => updateStatus(booking.id, 'REJECTED')}>Reject</Button>
                    </div>
                  )}
                  {role === 'provider' && booking.status === 'ACCEPTED' && (
                    <Button size="sm" variant="primary" onClick={() => updateStatus(booking.id, 'COMPLETED')}>Complete</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
