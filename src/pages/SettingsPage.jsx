import React, { useState, useEffect } from 'react';
import { getSettingsApi, updateSettingsApi } from '../services/settingsService';
import { Building, Mail, MessageSquare, Save, ShieldCheck } from 'lucide-react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    companyName: 'Kevalon Technology',
    website: 'www.kevalontechnology.in',
    email: 'sales@kevalontechnology.in',
    phone: '+91 90810 12218',
    senderName: 'Harsh Kothari',
    designation: 'CEO & Founder',
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpFromName: 'Harsh Kothari | Kevalon Technology',
    smtpFromEmail: 'sales@kevalontechnology.in',
    whatsappAccessToken: '',
    whatsappPhoneNumberId: '285349974658896',
    whatsappBusinessAccountId: '250264581511046',
    whatsappApiVersion: 'v18.0',
    whatsappPublicKey: '',
    whatsportalApiKey: 'wp_live_7gorCETjlPx2m05s6DJxDXozUPyX56Jg049D2l',
    whatsportalApiBaseUrl: 'https://app.whatsportal.io/api'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const res = await getSettingsApi();
        if (res.success && res.settings) {
          setSettings((prev) => ({ ...prev, ...res.settings }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettingsData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettingsApi(settings);
      alert('Settings saved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-xs text-slate-400">Loading Settings...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System & Channel Configuration</h1>
          <p className="text-xs text-slate-500">
            Configure Kevalon Technology sender details, Nodemailer SMTP, and WhatsApp Business Cloud API settings.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Company Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building className="w-4 h-4 text-brand-600" />
          Company & Sender Profile (Kevalon Technology)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 mt-1"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Website</label>
            <input
              type="text"
              value={settings.website}
              onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 mt-1"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Official Contact Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 mt-1"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Official Phone Number</label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 mt-1"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Primary Sender Name</label>
            <input
              type="text"
              value={settings.senderName}
              onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 mt-1"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Designation</label>
            <input
              type="text"
              value={settings.designation}
              onChange={(e) => setSettings({ ...settings, designation: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 mt-1"
            />
          </div>
        </div>
      </div>

      {/* Brevo Email Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Mail className="w-4 h-4 text-brand-600" />
            Brevo (Sendinblue) Transactional Email API Configuration
          </h2>
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
            settings.brevoApiKey
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {settings.brevoApiKey ? '🟢 Brevo Connected (Live)' : '🟡 Brevo Key Pending (Simulation Mode)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="font-semibold text-slate-700">Brevo API Key (`xkeysib-...`)</label>
            <input
              type="password"
              placeholder="xkeysib-..."
              value={settings.brevoApiKey || ''}
              onChange={(e) => setSettings({ ...settings, brevoApiKey: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 mt-1 font-mono text-xs focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Brevo Sender Email</label>
            <input
              type="email"
              placeholder="sales@kevalontechnology.in"
              value={settings.brevoSenderEmail || ''}
              onChange={(e) => setSettings({ ...settings, brevoSenderEmail: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 mt-1 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Brevo Sender Name</label>
            <input
              type="text"
              placeholder="Harsh Kothari | Kevalon Technology"
              value={settings.brevoSenderName || ''}
              onChange={(e) => setSettings({ ...settings, brevoSenderName: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 mt-1 font-medium"
            />
          </div>
        </div>
      </div>

      {/* WhatsApp Cloud API Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          WhatsApp Business Cloud API Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="font-semibold text-slate-700">WhatsApp Access Token</label>
            <textarea
              rows="2"
              placeholder="EAAG..."
              value={settings.whatsappAccessToken}
              onChange={(e) => setSettings({ ...settings, whatsappAccessToken: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 mt-1 font-mono"
            ></textarea>
          </div>

          <div>
            <label className="font-semibold text-slate-700">Phone Number ID</label>
            <input
              type="text"
              placeholder="10065..."
              value={settings.whatsappPhoneNumberId}
              onChange={(e) => setSettings({ ...settings, whatsappPhoneNumberId: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 mt-1 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Business Account ID</label>
            <input
              type="text"
              placeholder="1029..."
              value={settings.whatsappBusinessAccountId}
              onChange={(e) => setSettings({ ...settings, whatsappBusinessAccountId: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 mt-1 font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-semibold text-slate-700">WhatsPortal Live API Key (`wp_live_...`)</label>
            <input
              type="text"
              placeholder="wp_live_..."
              value={settings.whatsportalApiKey || ''}
              onChange={(e) => setSettings({ ...settings, whatsportalApiKey: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 mt-1 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-semibold text-slate-700">WhatsPortal API Base URL</label>
            <input
              type="text"
              placeholder="https://app.whatsportal.io/api"
              value={settings.whatsportalApiBaseUrl || ''}
              onChange={(e) => setSettings({ ...settings, whatsportalApiBaseUrl: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 mt-1 font-mono text-xs"
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-semibold text-slate-700">WhatsApp Public Key (RSA Key / Webhook Security)</label>
            <textarea
              rows="4"
              placeholder="-----BEGIN PUBLIC KEY-----\n..."
              value={settings.whatsappPublicKey || ''}
              onChange={(e) => setSettings({ ...settings, whatsappPublicKey: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 mt-1 font-mono text-xs"
            ></textarea>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SettingsPage;
