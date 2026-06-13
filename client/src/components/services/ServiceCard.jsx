import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

const categoryColors = {
  TUTORING: 'default', DESIGN: 'accent', PHOTOGRAPHY: 'info', MOVING: 'warning',
  CLEANING: 'success', TECH_SUPPORT: 'default', WRITING: 'info', FITNESS: 'success',
  MUSIC: 'accent', OTHER: 'default',
};

const categoryLabels = {
  TUTORING: 'Tutoring', DESIGN: 'Design', PHOTOGRAPHY: 'Photography', MOVING: 'Moving',
  CLEANING: 'Cleaning', TECH_SUPPORT: 'Tech Support', WRITING: 'Writing', FITNESS: 'Fitness',
  MUSIC: 'Music', OTHER: 'Other',
};

export default function ServiceCard({ service }) {
  const pricingLabel = { HOURLY: '/hr', FIXED: ' flat', FREE: '' };

  return (
    <Link to={`/listing/${service.id}`}>
      <Card className="h-full group">
        {service.imageUrl ? (
          <img src={service.imageUrl} alt={service.title} className="w-full h-40 object-cover rounded-xl mb-4" />
        ) : (
          <div className="w-full h-40 rounded-xl mb-4 bg-gradient-to-br from-primary-500/20 to-accent-400/20 flex items-center justify-center">
            <span className="text-4xl opacity-50">{categoryLabels[service.category]?.[0] || '?'}</span>
          </div>
        )}
        <Badge variant={categoryColors[service.category] || 'default'}>
          {categoryLabels[service.category] || service.category}
        </Badge>
        <h3 className="text-lg font-semibold mt-3 mb-1 group-hover:text-primary-300 transition-colors line-clamp-1">
          {service.title}
        </h3>
        <p className="text-sm text-surface-200/60 mb-4 line-clamp-2">{service.description}</p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Avatar name={`${service.provider?.firstName} ${service.provider?.lastName}`} size="sm" />
            <span className="text-sm text-surface-200/80">{service.provider?.firstName}</span>
          </div>
          <div className="flex items-center gap-3">
            {service.avgRating > 0 && (
              <span className="flex items-center gap-1 text-sm text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                {Number(service.avgRating).toFixed(1)}
              </span>
            )}
            <span className="text-sm font-semibold text-accent-400">
              {service.pricingType === 'FREE' ? 'Free' : `$${Number(service.price).toFixed(0)}${pricingLabel[service.pricingType]}`}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
