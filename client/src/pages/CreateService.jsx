import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { PenLine, DollarSign, Tag, Image } from 'lucide-react';

import { CATEGORIES } from '../data/categories';

export default function CreateService() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'ACADEMIC_TUTORING', price: '', pricingType: 'FIXED', imageUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/services', {
        ...form,
        price: parseFloat(form.price) || 0,
        imageUrl: form.imageUrl || undefined,
      });
      navigate(`/listing/${data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">Post a Service</h1>
      <p className="text-surface-200/60 mb-8">Share your skills with fellow students</p>

      <Card hover={false} className="p-8">
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Title" icon={PenLine} placeholder="e.g. Python Tutoring Sessions" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-200">Description</label>
            <textarea
              rows={5}
              placeholder="Describe your service in detail..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-surface-50 placeholder-surface-200/40 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-200">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-surface-50 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-surface-900">{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Price ($)" type="number" icon={DollarSign} placeholder="25" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-200">Pricing Type</label>
              <select
                value={form.pricingType}
                onChange={(e) => setForm({ ...form, pricingType: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-surface-50 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
                <option value="FIXED" className="bg-surface-900">Fixed Price</option>
                <option value="HOURLY" className="bg-surface-900">Per Hour</option>
                <option value="FREE" className="bg-surface-900">Free</option>
              </select>
            </div>
          </div>

          <Input label="Image URL (optional)" icon={Image} placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Publish Service
          </Button>
        </form>
      </Card>
    </div>
  );
}
