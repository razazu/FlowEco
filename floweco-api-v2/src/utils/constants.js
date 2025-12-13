// ========================================
// FlowEco API - Constants
// ========================================

export const VAT_RATE = 0.18;

export const DEFAULT_CATEGORIES = [
  { name: 'מזון וסופר', type: 'expense', icon: '🛒', color: '#10B981' },
  { name: 'מסעדות', type: 'expense', icon: '🍔', color: '#F59E0B' },
  { name: 'תחבורה', type: 'expense', icon: '🚗', color: '#3B82F6' },
  { name: 'דיור', type: 'expense', icon: '🏠', color: '#8B5CF6' },
  { name: 'חשבונות', type: 'expense', icon: '💡', color: '#EF4444' },
  { name: 'טלפון ואינטרנט', type: 'expense', icon: '📱', color: '#06B6D4' },
  { name: 'בילויים', type: 'expense', icon: '🎮', color: '#EC4899' },
  { name: 'ביגוד', type: 'expense', icon: '👕', color: '#667eea' },
  { name: 'בריאות', type: 'expense', icon: '💊', color: '#14B8A6' },
  { name: 'חופשות', type: 'expense', icon: '✈️', color: '#F97316' },
  { name: 'חינוך', type: 'expense', icon: '🎓', color: '#6366F1' },
  { name: 'ביטוחים', type: 'expense', icon: '🛡️', color: '#0EA5E9' },
  { name: 'מנויים', type: 'expense', icon: '📺', color: '#A855F7' },
  { name: 'תחביבים', type: 'expense', icon: '🎨', color: '#F472B6' },
  { name: 'קניות', type: 'expense', icon: '🛍️', color: '#A855F7' },
  { name: 'ספורט', type: 'expense', icon: '🏃', color: '#22C55E' },
  { name: 'מתנות', type: 'expense', icon: '🎁', color: '#E11D48' },
  { name: 'אחר', type: 'expense', icon: '📦', color: '#6B7280' },
  { name: 'משכורת', type: 'income', icon: '💰', color: '#10B981' },
  { name: 'בונוס', type: 'income', icon: '🎁', color: '#F59E0B' },
  { name: 'השקעות', type: 'income', icon: '📈', color: '#3B82F6' },
  { name: 'מתנה', type: 'income', icon: '🎀', color: '#EC4899' },
  { name: 'אחר', type: 'income', icon: '📦', color: '#6B7280' }
];

export const ALLOWED_ORIGINS = [
  'https://flowraz.io',
  'https://www.flowraz.io',
  'https://floweco.app',
  'https://www.floweco.app',
  'http://localhost:3000',
  'http://localhost:8080'
];
