import { Bot, Home, Leaf, Scan, Sparkles, TestTube2, Star, Mic, HeartPulse, Sprout, Utensils, UtensilsCrossed } from 'lucide-react';

export const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/prakriti-test', label: 'Prakriti Test', icon: TestTube2 },
  { href: '/herbarium', label: 'Herbarium', icon: Leaf },
  { href: '/favorites', label: 'My Favorites', icon: Star },
  { href: '/garden-planner', label: 'Garden Planner', icon: Sprout },
  { href: '/plant-identifier', label: 'Identifier', icon: Scan },
  { href: '/food-scanner', label: 'Food Scanner', icon: UtensilsCrossed },
  { href: '/wellness-tips', label: 'Wellness Tips', icon: Sparkles },
  { href: '/seasonal-diet', label: 'Seasonal Diet', icon: Utensils },
  { href: '/remedy-generator', label: 'Remedy Generator', icon: HeartPulse },
  { href: '/text-chatbot', label: 'Chatbot', icon: Bot },
  { href: '/chatbot', label: 'Voice Assistant', icon: Mic },
];

export const DOSHAS = {
  vata: { name: 'Vata', color: 'text-blue-500', bgColor: 'bg-blue-100' },
  pitta: { name: 'Pitta', color: 'text-red-500', bgColor: 'bg-red-100' },
  kapha: { name: 'Kapha', color: 'text-green-500', bgColor: 'bg-green-100' },
};
