import { useState, useEffect } from 'react';
import api from '../../lib/api';
import SearchableSelect from '../../components/ui/SearchableSelect';
import { FACULTIES, LEVELS, GENDERS } from '../../data/categories';
import { Camera, ArrowRight, ArrowLeft } from 'lucide-react';

export default function StepProfile({ progress, onNext, user, setStepProgress }) {
  const saved = progress?.profile || {};
  const [form, setForm] = useState({
    phone: saved.phone || '',
    gender: saved.gender || '',
    faculty: saved.faculty || '',
    level: saved.level || '',
    bio: saved.bio || '',
    avatarUrl: saved.avatarUrl || '',
  });
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const totalQuestions = 7;

  useEffect(() => {
    if (setStepProgress) {
      setStepProgress({ current: currentQIdx, total: totalQuestions, title: 'About You' });
    }
  }, [currentQIdx, setStepProgress]);

  const questions = [
    { id: 'name', type: 'name', title: "What's your name?", subtitle: "Confirm the name you signed up with." },
    { id: 'phone', type: 'phone', title: "What's your phone number?" },
    { id: 'gender', type: 'gender', title: "What's your gender?" },
    { id: 'faculty', type: 'faculty', title: "Which faculty are you in?" },
    { id: 'level', type: 'level', title: "What level are you?" },
    { id: 'avatarUrl', type: 'avatar', title: "Add a profile photo (optional)" },
    { id: 'bio', type: 'bio', title: "Tell us about yourself (optional)" }
  ];

  const goNextQ = () => {
    if (currentQIdx === 1 && !form.phone.trim()) { setError('Please enter a phone number'); return; }
    if (currentQIdx === 2 && !form.gender) { setError('Please select your gender'); return; }
    if (currentQIdx === 3 && !form.faculty) { setError('Please select your faculty'); return; }
    if (currentQIdx === 4 && !form.level) { setError('Please select your level'); return; }

    setError('');
    
    if (currentQIdx < totalQuestions - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQIdx(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      handleSubmit();
    }
  };

  const goPrevQ = () => {
    setError('');
    if (currentQIdx > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQIdx(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put('/onboarding/profile', form);
      onNext();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goNextQ();
    }
  };

  const renderInput = (q) => {
    switch (q.type) {
      case 'name':
        return (
          <input
            type="text"
            readOnly
            value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
            className="w-full h-[52px] px-[16px] py-[14px] text-[1rem] bg-gray-50 border border-[#E5E7EB] rounded-[8px] text-[#0A0A0A]"
          />
        );
      case 'phone':
        return (
          <input
            type="text"
            placeholder="e.g. 08012345678"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full h-[52px] px-[16px] py-[14px] text-[1rem] bg-white border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#0A0A0A] focus:ring-[3px] focus:ring-opacity-15 focus:ring-[#F59E0B]"
          />
        );
      case 'gender':
        return (
          <div className="flex flex-col gap-3">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                onClick={() => { setForm({ ...form, gender: g.value }); setTimeout(goNextQ, 150); }}
                className={`w-full py-4 px-6 text-left text-[1rem] font-medium rounded-xl border transition-all duration-150 ${
                  form.gender === g.value
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                    : 'bg-white text-[#0A0A0A] border-[#E5E7EB] hover:border-[#0A0A0A]'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        );
      case 'faculty':
        return (
          <div onKeyDown={handleKeyDown}>
            <SearchableSelect
              options={FACULTIES}
              value={form.faculty}
              onChange={(val) => setForm({ ...form, faculty: val })}
              placeholder="Search your faculty…"
            />
          </div>
        );
      case 'level':
        return (
          <div className="flex flex-wrap gap-3">
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => { setForm({ ...form, level: lvl }); setTimeout(goNextQ, 150); }}
                className={`px-6 py-3 text-[1rem] font-medium rounded-full border transition-all duration-150 ${
                  form.level === lvl
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                    : 'bg-white text-[#0A0A0A] border-[#E5E7EB] hover:border-[#0A0A0A]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        );
      case 'avatar':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 mb-2">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border border-[#E5E7EB]" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#FAFAFA] flex items-center justify-center border border-[#E5E7EB]">
                  <Camera className="w-8 h-8 text-[#E5E7EB]" />
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="https://example.com/photo.jpg"
              value={form.avatarUrl}
              onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full h-[52px] px-[16px] py-[14px] text-[1rem] bg-white border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#0A0A0A] focus:ring-[3px] focus:ring-opacity-15 focus:ring-[#F59E0B]"
            />
          </div>
        );
      case 'bio':
        return (
          <textarea
            placeholder="Tell us a bit about yourself…"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            autoFocus
            className="w-full min-h-[120px] px-[16px] py-[14px] text-[1rem] bg-white border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#0A0A0A] focus:ring-[3px] focus:ring-opacity-15 focus:ring-[#F59E0B] resize-none"
          />
        );
      default: return null;
    }
  };

  const currentQ = questions[currentQIdx];

  return (
    <div className={`w-full flex flex-col ${isAnimating ? 'animate-typeform-exit' : 'animate-typeform-enter'}`}>
      <div className="text-[#6B7280] text-sm font-bold mb-4">
        {String(currentQIdx + 1).padStart(2, '0')} <ArrowRight className="inline w-4 h-4 ml-1 mb-[2px]" />
      </div>
      
      <h2 className="text-[1.75rem] font-[700] text-[#0A0A0A] mb-2 leading-tight">
        {currentQ.title}
      </h2>
      
      {currentQ.subtitle && (
        <p className="text-[#6B7280] text-base mb-6">{currentQ.subtitle}</p>
      )}
      
      {!currentQ.subtitle && <div className="mb-6" />}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="w-full mb-8">
        {renderInput(currentQ)}
      </div>

      <div className="flex flex-col gap-4">
        {/* Buttons layout: skip if optional, else just OK */}
        <div className="flex items-center gap-4">
          <button
            onClick={goNextQ}
            disabled={loading}
            className={`flex items-center justify-center gap-2 h-[44px] rounded-lg font-bold transition-all duration-200 ${
              currentQIdx === totalQuestions - 1 
                ? 'w-[140px] bg-[#F59E0B] text-[#0A0A0A] hover:bg-[#d47600]' 
                : 'w-[120px] bg-[#0A0A0A] text-white hover:bg-[#F59E0B] hover:text-[#0A0A0A]'
            } disabled:opacity-50`}
          >
            {loading ? '...' : currentQIdx === totalQuestions - 1 ? 'Continue' : 'OK'} 
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Action links */}
        <div className="flex items-center gap-6 mt-2">
          {currentQIdx > 0 && (
            <button onClick={goPrevQ} className="text-[#6B7280] text-sm font-medium hover:text-[#0A0A0A] flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          )}
          {(currentQIdx === 5 || currentQIdx === 6) && (
            <button onClick={goNextQ} className="text-[#6B7280] text-sm font-medium hover:text-[#0A0A0A] transition-colors">
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
