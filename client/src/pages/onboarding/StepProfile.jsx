import { useState } from 'react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SearchableSelect from '../../components/ui/SearchableSelect';
import { FACULTIES, LEVELS, GENDERS } from '../../data/categories';
import { Phone, User, Camera, ArrowRight } from 'lucide-react';

export default function StepProfile({ progress, onNext, user }) {
  const saved = progress?.profile || {};
  const [form, setForm] = useState({
    phone: saved.phone || '',
    gender: saved.gender || '',
    faculty: saved.faculty || '',
    level: saved.level || '',
    bio: saved.bio || '',
    avatarUrl: saved.avatarUrl || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.faculty) e.faculty = 'Faculty is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.put('/onboarding/profile', form);
      onNext();
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to save' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {errors.submit && (
        <div className="p-3 rounded-xl bg-error-50 dark:bg-error-700/10 border border-error-200 dark:border-error-700/30 text-sm text-error-600 dark:text-error-400">{errors.submit}</div>
      )}

      {/* Profile photo */}
      <div className="flex items-center gap-5">
        <div className="relative">
          {form.avatarUrl ? (
            <img src={form.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover ring-3 ring-[var(--border-default)]" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center ring-3 ring-[var(--border-default)]">
              <Camera className="w-7 h-7 text-primary-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <Input
            label="Profile Photo URL (optional)"
            placeholder="https://example.com/photo.jpg"
            value={form.avatarUrl}
            onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
          />
        </div>
      </div>

      {/* Phone */}
      <Input
        label="Phone Number"
        icon={Phone}
        placeholder="+234 800 000 0000"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        error={errors.phone}
        required
      />

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-heading)' }}>Gender</label>
        <div className="flex gap-3">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setForm({ ...form, gender: g.value })}
              className={[
                'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer',
                form.gender === g.value
                  ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-500 text-primary-600 dark:text-primary-300'
                  : 'border-[var(--border-default)] hover:border-[var(--border-strong)]',
              ].join(' ')}
              style={form.gender !== g.value ? { color: 'var(--text-muted)' } : undefined}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty — searchable dropdown */}
      <SearchableSelect
        label="Faculty"
        options={FACULTIES}
        value={form.faculty}
        onChange={(val) => setForm({ ...form, faculty: val })}
        placeholder="Search your faculty…"
        error={errors.faculty}
      />

      {/* Level */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-heading)' }}>Level</label>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setForm({ ...form, level: lvl })}
              className={[
                'px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer',
                form.level === lvl
                  ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-500 text-primary-600 dark:text-primary-300'
                  : 'border-[var(--border-default)] hover:border-[var(--border-strong)]',
              ].join(' ')}
              style={form.level !== lvl ? { color: 'var(--text-muted)' } : undefined}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" style={{ color: 'var(--text-heading)' }}>Short Bio (optional)</label>
        <textarea
          rows={3}
          placeholder="Tell others a bit about yourself…"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          maxLength={300}
          className="w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 resize-none focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-[var(--ring-focus)]"
          style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-body)', borderColor: 'var(--border-default)' }}
        />
        <p className="text-xs text-right" style={{ color: 'var(--text-faint)' }}>{form.bio.length}/300</p>
      </div>

      {/* Next button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSubmit} size="lg" loading={loading}>
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
