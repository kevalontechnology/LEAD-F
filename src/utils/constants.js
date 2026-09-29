export const API_BASE_URL = 'http://localhost:5000/api';

export const LEAD_STATUSES = {
  NEW: { label: 'New', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  MESSAGE_READY: { label: 'Message Ready', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  CONTACTED: { label: 'Contacted', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  FOLLOW_UP: { label: 'Follow Up', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  INTERESTED: { label: 'Interested', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  QUALIFIED: { label: 'Qualified', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  CONVERTED: { label: 'Converted', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  NOT_INTERESTED: { label: 'Not Interested', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  DO_NOT_CONTACT: { label: 'Do Not Contact', color: 'bg-red-100 text-red-800 border-red-300 font-semibold' }
};

export const WHATSAPP_STATUSES = {
  NOT_AVAILABLE: { label: 'N/A', color: 'bg-gray-100 text-gray-500' },
  NOT_SENT: { label: 'Not Sent', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  SENT: { label: 'Sent', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  DELIVERED: { label: 'Delivered', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  READ: { label: 'Read', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  REPLIED: { label: 'Replied', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  FAILED: { label: 'Failed', color: 'bg-red-50 text-red-700 border-red-200' }
};

export const EMAIL_STATUSES = {
  NOT_AVAILABLE: { label: 'N/A', color: 'bg-gray-100 text-gray-500' },
  NOT_SENT: { label: 'Not Sent', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  SENT: { label: 'Sent', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  DELIVERED: { label: 'Delivered', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  OPENED: { label: 'Opened', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  REPLIED: { label: 'Replied', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  FAILED: { label: 'Failed', color: 'bg-red-50 text-red-700 border-red-200' }
};

export const CATEGORIES = [
  'Advertising Agency',
  'Outdoor Advertising',
  'Digital Marketing',
  'SEO & Performance',
  'Branding & Graphic Design',
  'IT & Software Development',
  'General Business'
];
