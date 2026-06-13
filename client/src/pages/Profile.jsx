import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { User, Mail, GraduationCap, Save } from 'lucide-react';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    university: user?.university || '',
    bio: user?.bio || '',
    activeRoles: user?.activeRoles || ['SEEKER'],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const toggleRole = (role) => {
    setForm((prev) => {
      const has = prev.activeRoles.includes(role);
      let roles;
      if (has) {
        roles = prev.activeRoles.filter((r) => r !== role);
        if (roles.length === 0) roles = ['SEEKER'];
      } else {
        roles = [...prev.activeRoles, role];
      }
      return { ...prev, activeRoles: roles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await api.put('/users/me', form);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">Profile</h1>
      <p className="text-surface-200/60 mb-8">Manage your account settings</p>

      <Card hover={false} className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size="xl" />
          <div>
            <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
            <p className="text-sm text-surface-200/50">{user?.email}</p>
            <div className="flex gap-2 mt-2">
              {user?.activeRoles?.map((role) => (
                <Badge key={role} variant={role === 'PROVIDER' ? 'accent' : 'default'}>{role}</Badge>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
        )}
        {success && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" icon={User} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <Input label="University" icon={GraduationCap} value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} required />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-200">Bio</label>
            <textarea
              rows={4}
              placeholder="Tell others about yourself..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-surface-50 placeholder-surface-200/40 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-200 mb-2">Roles</label>
            <div className="flex gap-3">
              {[
                { role: 'SEEKER', label: '🔍 Service Seeker' },
                { role: 'PROVIDER', label: '💼 Service Provider' },
              ].map(({ role, label }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border cursor-pointer ${
                    form.activeRoles.includes(role)
                      ? 'bg-primary-500/20 border-primary-500/40 text-primary-300'
                      : 'border-white/10 text-surface-200/60 hover:border-white/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
