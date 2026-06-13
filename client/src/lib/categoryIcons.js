/**
 * Maps category icon string names to Lucide React components.
 * Import this when you need to render an icon from category data.
 *
 * Usage:
 *   import { getCategoryIcon } from '../lib/categoryIcons';
 *   const Icon = getCategoryIcon('BookOpen');
 *   return <Icon className="w-6 h-6" />;
 */
import {
  BookOpen,
  UtensilsCrossed,
  Sparkles,
  Monitor,
  Scissors,
  Wrench,
  Heart,
  Palette,
  Truck,
  Globe,
  PenLine,
  Cpu,
  BarChart2,
  Activity,
  Home,
  Printer,
  ShoppingBag,
  Briefcase,
  HelpCircle,
} from 'lucide-react';

const ICON_MAP = {
  BookOpen,
  UtensilsCrossed,
  Sparkles,
  Monitor,
  Scissors,
  Wrench,
  Heart,
  Palette,
  Truck,
  Globe,
  PenLine,
  Cpu,
  BarChart2,
  Activity,
  Home,
  Printer,
  ShoppingBag,
  Briefcase,
};

/**
 * Resolve a Lucide icon name string to a React component.
 * Falls back to HelpCircle if not found.
 */
export function getCategoryIcon(iconName) {
  return ICON_MAP[iconName] || HelpCircle;
}

export default ICON_MAP;
