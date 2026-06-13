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
    <div className="w-full max-w-[640px] mx-auto py-[40px] px-[24px]">
      {/* Header */}
      <div className="animate-step-heading mb-[40px]">
        <h2 className="text-[2.5rem] md:text-[3rem] font-[800] leading-[1.1] text-[#0A0A0A] mb-2 tracking-tight">Tell us about you.</h2>
        <p className="text-base text-[#6B7280] animate-step-subheading">Help others know who they are connecting with.</p>
      </div>

      {errors.submit && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          {errors.submit}
        </div>
      )}

      {/* Profile photo */}
      <div className="animate-step-field mb-[24px]" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-4 mb-4">
          {form.avatarUrl ? (
            <img src={form.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border border-[#E5E7EB]" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#FAFAFA] flex flex-col items-center justify-center border border-[#E5E7EB]">
              <Camera className="w-6 h-6 text-[#F59E0B] mb-1" />
              <span className="text-[10px] text-[#6B7280]">Upload photo</span>
            </div>
          )}
        </div>
        <div className="w-full">
          <label className="block text-[0.875rem] font-[600] text-[#0A0A0A] mb-[8px]">Profile Photo URL (optional)</label>
          <input
            type="text"
            placeholder="https://example.com/photo.jpg"
            value={form.avatarUrl}
            onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
            className="w-full h-[52px] px-[16px] py-[14px] text-[1rem] bg-white border border-[#E5E7EB] rounded-[8px] transition-all duration-150 focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#F59E0B]"
          />
        </div>
      </div>

      {/* Phone */}
      <div className="animate-step-field mb-[24px]" style={{ animationDelay: '250ms' }}>
        <label className="block text-[0.875rem] font-[600] text-[#0A0A0A] mb-[8px]">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="+234 800 000 0000"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={`w-full h-[52px] pl-[40px] pr-[16px] py-[14px] text-[1rem] bg-white border ${errors.phone ? 'border-red-500' : 'border-[#E5E7EB]'} rounded-[8px] transition-all duration-150 focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#F59E0B]`}
          />
        </div>
        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
      </div>

      {/* Gender */}
      <div className="animate-step-field mb-[24px]" style={{ animationDelay: '300ms' }}>
        <label className="block text-[0.875rem] font-[600] text-[#0A0A0A] mb-[8px]">Gender</label>
        <div className="flex flex-wrap">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setForm({ ...form, gender: g.value })}
              className={`h-[44px] px-[20px] py-[10px] text-[0.9rem] rounded-full border transition-all duration-150 mr-[8px] mb-[8px] ${
                form.gender === g.value
                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                  : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#0A0A0A]'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty */}
      <div className="animate-step-field mb-[24px]" style={{ animationDelay: '350ms' }}>
        <label className="block text-[0.875rem] font-[600] text-[#0A0A0A] mb-[8px]">Faculty</label>
        <SearchableSelect
          options={FACULTIES}
          value={form.faculty}
          onChange={(val) => setForm({ ...form, faculty: val })}
          placeholder="Search your faculty…"
          error={errors.faculty}
        />
      </div>

      {/* Level */}
      <div className="animate-step-field mb-[24px]" style={{ animationDelay: '400ms' }}>
        <label className="block text-[0.875rem] font-[600] text-[#0A0A0A] mb-[8px]">Level</label>
        <div className="flex flex-wrap">
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setForm({ ...form, level: lvl })}
              className={`h-[44px] px-[20px] py-[10px] text-[0.9rem] rounded-full border transition-all duration-150 mr-[8px] mb-[8px] ${
                form.level === lvl
                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                  : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#0A0A0A]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="animate-step-field mb-[24px]" style={{ animationDelay: '450ms' }}>
        <label className="block text-[0.875rem] font-[600] text-[#0A0A0A] mb-[8px]">Short Bio (optional)</label>
        <textarea
          placeholder="Tell others a bit about yourself…"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          maxLength={300}
          className="w-full min-h-[120px] px-[16px] py-[14px] text-[1rem] bg-white border border-[#E5E7EB] rounded-[8px] transition-all duration-150 focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#F59E0B] resize-none"
        />
        <p className="text-xs text-[#6B7280] text-right mt-1">{form.bio.length}/300</p>
      </div>

      {/* Next button */}
      <div className="pt-6 animate-step-btn">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-[#0A0A0A] text-white rounded-xl font-bold transition-all duration-200 hover:bg-[#F59E0B] hover:text-[#0A0A0A] active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Continue'}
          {!loading && <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
