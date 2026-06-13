import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

const categoryLabels = {
  TUTORING: 'Tutoring', DESIGN: 'Design', PHOTOGRAPHY: 'Photography', MOVING: 'Moving',
  CLEANING: 'Cleaning', TECH_SUPPORT: 'Tech Support', WRITING: 'Writing', FITNESS: 'Fitness',
  MUSIC: 'Music', OTHER: 'Other',
};

export default function MyServices() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyServices = async () => {
    try {
      const { data } = await api.get('/services?limit=100');
      const mine = data.data.services.filter((s) => s.providerId === user.id);
      setServices(mine);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyServices(); }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Services</h1>
          <p className="text-surface-200/60">Manage your service listings</p>
        </div>
        <Link to="/services/create">
          <Button size="sm"><PlusCircle className="w-4 h-4" /> New Service</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 glass rounded-2xl animate-pulse" />)}
        </div>
      ) : services.length === 0 ? (
        <Card hover={false} className="text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">No services yet</h3>
          <p className="text-surface-200/60 mb-6">Post your first service to start earning!</p>
          <Link to="/services/create"><Button>Post a Service</Button></Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <Card key={service.id} hover={false} className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <Badge variant={service.isActive ? 'success' : 'default'} className="mb-2">
                  {service.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <h3 className="font-semibold mb-1 truncate">{service.title}</h3>
                <p className="text-sm text-surface-200/50">
                  {categoryLabels[service.category]} · ${Number(service.price).toFixed(0)} {service.pricingType === 'HOURLY' ? '/hr' : ''}
                </p>
                <p className="text-xs text-surface-200/40 mt-1">
                  {service._count?.reviews || 0} reviews · {service._count?.bookings || 0} bookings
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Link to={`/listing/${service.id}`}>
                  <button className="p-2 rounded-xl hover:bg-white/10 text-surface-200/60 hover:text-white transition-colors cursor-pointer">
                    <Pencil className="w-4 h-4" />
                  </button>
                </Link>
                <button onClick={() => handleDelete(service.id)} className="p-2 rounded-xl hover:bg-red-500/10 text-surface-200/60 hover:text-red-400 transition-colors cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
