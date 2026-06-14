import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { PenLine, DollarSign, Image } from 'lucide-react';

import { CATEGORIES } from '../data/categories';

export default function CreateService() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'ACADEMIC_TUTORING', price: '', pricingType: 'FIXED', imageUrl: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        imageUrl: form.imageUrl || undefined,
      };
      console.log('Submitting POST /services with payload:', payload);
      const { data } = await api.post('/services', payload);
      navigate(`/listing/${data.data.id}`);
    } catch (err) {
      if (err.response?.data?.errors) {
        const errorsMap = {};
        err.response.data.errors.forEach(e => {
          errorsMap[e.field] = e.message;
        });
        setFieldErrors(errorsMap);
        setError('Please fix the errors below.');
      } else {
        setError(err.response?.data?.message || 'Failed to create service');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper page-container" style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0A0A0A', marginBottom: 8 }}>Post a Service</h1>
      <p style={{ fontSize: '1rem', color: '#6B7280', marginBottom: 32 }}>Share your skills with fellow students</p>

      <Card hover={false} style={{ padding: 32 }}>
        {error && (
          <div style={{ marginBottom: 24, padding: 12, borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Input 
            label="Title" 
            icon={PenLine} 
            placeholder="e.g. Python Tutoring Sessions" 
            value={form.title} 
            onChange={(e) => { setForm({ ...form, title: e.target.value }); setFieldErrors(prev => ({...prev, title: null})); }} 
            error={fieldErrors.title}
            required 
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0A0A0A' }}>Description</label>
            <textarea
              rows={5}
              placeholder="Describe your service in detail..."
              value={form.description}
              onChange={(e) => { setForm({ ...form, description: e.target.value }); setFieldErrors(prev => ({...prev, description: null})); }}
              className="focus-ring"
              style={{
                width: '100%', padding: '10px 16px', borderRadius: 12, background: '#fff',
                border: fieldErrors.description ? '1.5px solid #EF4444' : '1.5px solid #E5E7EB', color: '#0A0A0A', fontSize: '0.9375rem',
                outline: 'none', resize: 'none', transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => { e.target.style.borderColor = fieldErrors.description ? '#EF4444' : '#0A0A0A'; e.target.style.boxShadow = fieldErrors.description ? '0 0 0 3px rgba(239,68,68,0.15)' : '0 0 0 3px rgba(245,158,11,0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = fieldErrors.description ? '#EF4444' : '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
              required
            />
            {fieldErrors.description && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 2 }}>{fieldErrors.description}</p>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0A0A0A' }}>Category</label>
            <select
              value={form.category}
              onChange={(e) => { setForm({ ...form, category: e.target.value }); setFieldErrors(prev => ({...prev, category: null})); }}
              className="focus-ring"
              style={{
                width: '100%', padding: '10px 16px', borderRadius: 12, background: '#fff',
                border: fieldErrors.category ? '1.5px solid #EF4444' : '1.5px solid #E5E7EB', color: '#0A0A0A', fontSize: '0.9375rem',
                outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit',
              }}
              onFocus={(e) => { e.target.style.borderColor = fieldErrors.category ? '#EF4444' : '#0A0A0A'; e.target.style.boxShadow = fieldErrors.category ? '0 0 0 3px rgba(239,68,68,0.15)' : '0 0 0 3px rgba(245,158,11,0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = fieldErrors.category ? '#EF4444' : '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {fieldErrors.category && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 2 }}>{fieldErrors.category}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input 
              label="Price ($)" 
              type="number" 
              icon={DollarSign} 
              placeholder="25" 
              min="0" 
              step="0.01" 
              value={form.price} 
              onChange={(e) => { setForm({ ...form, price: e.target.value }); setFieldErrors(prev => ({...prev, price: null})); }} 
              error={fieldErrors.price}
              required 
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0A0A0A' }}>Pricing Type</label>
              <select
                value={form.pricingType}
                onChange={(e) => { setForm({ ...form, pricingType: e.target.value }); setFieldErrors(prev => ({...prev, pricingType: null})); }}
                className="focus-ring"
                style={{
                  width: '100%', padding: '10px 16px', borderRadius: 12, background: '#fff',
                  border: fieldErrors.pricingType ? '1.5px solid #EF4444' : '1.5px solid #E5E7EB', color: '#0A0A0A', fontSize: '0.9375rem',
                  outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit',
                }}
                onFocus={(e) => { e.target.style.borderColor = fieldErrors.pricingType ? '#EF4444' : '#0A0A0A'; e.target.style.boxShadow = fieldErrors.pricingType ? '0 0 0 3px rgba(239,68,68,0.15)' : '0 0 0 3px rgba(245,158,11,0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = fieldErrors.pricingType ? '#EF4444' : '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="FIXED">Fixed Price</option>
                <option value="HOURLY">Per Hour</option>
                <option value="FREE">Free</option>
              </select>
              {fieldErrors.pricingType && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 2 }}>{fieldErrors.pricingType}</p>}
            </div>
          </div>

          <Input 
            label="Image URL (optional)" 
            icon={Image} 
            placeholder="https://..." 
            value={form.imageUrl} 
            onChange={(e) => { setForm({ ...form, imageUrl: e.target.value }); setFieldErrors(prev => ({...prev, imageUrl: null})); }} 
            error={fieldErrors.imageUrl}
          />

          <Button type="submit" style={{ width: '100%', marginTop: 12 }} size="lg" loading={loading}>
            Publish Service
          </Button>
        </form>
      </Card>
    </div>
  );
}
