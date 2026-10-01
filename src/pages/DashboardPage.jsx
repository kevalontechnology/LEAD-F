import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Users,
  MessageSquareText,
  Send,
  Mail,
  Phone,
  AlertTriangle,
  CalendarCheck,
  Clock,
  ThumbsUp,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Filter,
  BarChart2,
  PieChart,
  Contact2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
        <span className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-2"></span>
        Loading Kevalon CRM Dashboard...
      </div>
    );
  }

  const { cards, charts } = data || { cards: {}, charts: {} };

  const statCards = [
    { label: 'Total Leads', count: cards.totalLeads || 0, icon: Users, color: 'bg-blue-600', link: '/leads' },
    { label: 'Mobile Available', count: cards.mobileAvailable || 0, icon: Phone, color: 'bg-emerald-600', link: '/leads?quickFilter=HAS_MOBILE' },
    { label: 'Email Available', count: cards.emailAvailable || 0, icon: Mail, color: 'bg-sky-600', link: '/leads?quickFilter=HAS_EMAIL' },
    { label: 'Both Available', count: cards.bothAvailable || 0, icon: CheckCircle2, color: 'bg-indigo-600', link: '/leads?quickFilter=HAS_BOTH' },
    { label: 'New Leads', count: cards.newLeads || 0, icon: Sparkles, color: 'bg-teal-600', link: '/leads?quickFilter=NOT_CONTACTED' },
    { label: 'Messages Ready', count: cards.messagesReady || 0, icon: MessageSquareText, color: 'bg-purple-600', link: '/leads?quickFilter=MESSAGE_READY' },
    { label: 'WhatsApp Sent', count: cards.whatsappSent || 0, icon: Send, color: 'bg-emerald-700', link: '/leads?quickFilter=WHATSAPP_SENT' },
    { label: 'Email Sent', count: cards.emailSent || 0, icon: Mail, color: 'bg-blue-700', link: '/leads?quickFilter=EMAIL_SENT' },
    { label: 'Failed Outreach', count: cards.failedCount || 0, icon: AlertTriangle, color: 'bg-red-600', link: '/leads?quickFilter=FAILED' },
    { label: "Today's Follow-ups", count: cards.followUpsToday || 0, icon: CalendarCheck, color: 'bg-amber-600', link: '/followups?tab=TODAY' },
    { label: 'Overdue Follow-ups', count: cards.overdueFollowUps || 0, icon: Clock, color: 'bg-rose-600', link: '/followups?tab=OVERDUE' },
    { label: 'Interested', count: cards.interestedLeads || 0, icon: ThumbsUp, color: 'bg-violet-600', link: '/leads?quickFilter=INTERESTED' },
    { label: 'Converted', count: cards.convertedLeads || 0, icon: CheckCircle2, color: 'bg-green-700', link: '/leads?quickFilter=CONVERTED' }
  ];

  const total = cards.totalLeads || 1;
  const mobilePct = Math.round(((cards.mobileAvailable || 0) / total) * 100);
  const emailPct = Math.round(((cards.emailAvailable || 0) / total) * 100);
  const bothPct = Math.round(((cards.bothAvailable || 0) / total) * 100);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner with Kevalon Logo */}
      <div className="bg-gradient-to-r from-[#021c33] via-[#0a4b7c] to-[#003865] text-white rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-xl shadow-xs">
            <img src="/logo.png" alt="Kevalon Technology Logo" className="h-7 object-contain" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Lead Management & Category Analytics</h1>
          <p className="text-xs text-slate-200 max-w-xl leading-relaxed">
            Real-time breakdown of all lead categories, contact details (Mobile, Email, Both), automated outreach messages, WhatsApp & Email sending stats.
          </p>
        </div>

        <button
          onClick={() => navigate('/import-leads')}
          className="px-5 py-3 bg-[#34b3d6] hover:bg-[#2bb5d8] text-slate-900 text-xs font-bold rounded-xl shadow-lg transition-all shrink-0 flex items-center gap-2"
        >
          Import Excel / CSV Leads
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Contact Information Availability Widget (Mobile, Email, Both) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Contact2 className="w-5 h-5 text-brand-600" />
            Contact Detail Availability Breakdown (Mobile, Email & Both)
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Total Leads in Database: <strong className="text-slate-900">{cards.totalLeads || 0}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Mobile Number Available */}
          <div
            onClick={() => navigate('/leads?quickFilter=HAS_MOBILE')}
            className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                Mobile Number Available
              </span>
              <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                {mobilePct}%
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-900">{cards.mobileAvailable || 0}</div>
            <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${mobilePct}%` }}></div>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">Leads with valid mobile number ready for WhatsApp</p>
          </div>

          {/* Email ID Available */}
          <div
            onClick={() => navigate('/leads?quickFilter=HAS_EMAIL')}
            className="p-4 bg-sky-50/60 rounded-xl border border-sky-200 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-sky-600" />
                Email ID Available
              </span>
              <span className="text-xs font-black bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                {emailPct}%
              </span>
            </div>
            <div className="text-2xl font-black text-sky-900">{cards.emailAvailable || 0}</div>
            <div className="h-2 bg-sky-100 rounded-full overflow-hidden">
              <div className="h-full bg-sky-600 rounded-full" style={{ width: `${emailPct}%` }}></div>
            </div>
            <p className="text-[11px] text-sky-700 font-medium">Leads with valid email address ready for Brevo Email</p>
          </div>

          {/* Both Available */}
          <div
            onClick={() => navigate('/leads?quickFilter=HAS_BOTH')}
            className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                Both (Mobile & Email) Available
              </span>
              <span className="text-xs font-black bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
                {bothPct}%
              </span>
            </div>
            <div className="text-2xl font-black text-indigo-900">{cards.bothAvailable || 0}</div>
            <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${bothPct}%` }}></div>
            </div>
            <p className="text-[11px] text-indigo-700 font-medium">Complete contact profiles eligible for Dual Channel Outreach</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(card.link)}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg ${card.color} text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900">{card.count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Breakdown Table (All Categories with Exact Counts) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand-600" />
              Category-Wise Detailed Breakdown & Contact Counts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact category lead count, mobile count, email count, both available, ready messages, sent stats.
            </p>
          </div>
          <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full border border-brand-200 self-start sm:self-auto">
            Total Categories: {charts.byCategory ? charts.byCategory.length : 0}
          </span>
        </div>

        {charts.byCategory && charts.byCategory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-3 rounded-l-lg">Category Name</th>
                  <th className="p-3 text-center">Total Leads</th>
                  <th className="p-3 text-center">📱 Mobile</th>
                  <th className="p-3 text-center">📧 Email</th>
                  <th className="p-3 text-center">⚡ Both</th>
                  <th className="p-3 text-center">WhatsApp Sent</th>
                  <th className="p-3 text-center">Email Sent</th>
                  <th className="p-3 text-center">Interested</th>
                  <th className="p-3">Database Share</th>
                  <th className="p-3 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {charts.byCategory.map((cat, i) => {
                  const percentage = cards.totalLeads ? Math.round((cat.count / cards.totalLeads) * 100) : 0;
                  return (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        {cat.category}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-900">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-full">{cat.count}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                          {cat.mobileAvailable || 0}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-sky-50 text-sky-800 font-bold px-2.5 py-1 rounded-full border border-sky-200">
                          {cat.emailAvailable || 0}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-indigo-50 text-indigo-800 font-bold px-2.5 py-1 rounded-full border border-indigo-200">
                          {cat.bothAvailable || 0}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                          {cat.whatsappSent || 0}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-sky-50 text-sky-700 font-bold px-2.5 py-1 rounded-full border border-sky-200">
                          {cat.emailSent || 0}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-violet-50 text-violet-700 font-bold px-2.5 py-1 rounded-full border border-violet-200">
                          {cat.interested || 0}
                        </span>
                      </td>
                      <td className="p-3 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-600 rounded-full"
                              style={{ width: `${Math.max(percentage, 3)}%` }}
                            ></div>
                          </div>
                          <span className="text-[11px] font-bold text-slate-600 w-8">{percentage}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => navigate(`/leads?category=${encodeURIComponent(cat.category)}`)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-brand-600 hover:text-white text-slate-700 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          View Leads ➜
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">No category breakdown data available yet.</p>
        )}
      </div>

      {/* City & Pipeline Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              Leads by Location / City
            </span>
            <span className="text-xs font-normal text-slate-400">Top Cities</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            {charts.byCity && charts.byCity.length > 0 ? (
              charts.byCity.map((c, i) => {
                const percentage = cards.totalLeads ? Math.round((c.count / cards.totalLeads) * 100) : 0;
                return (
                  <div key={i} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800">{c.city}</span>
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <span>{c.count} leads</span>
                      <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-md text-slate-600">{percentage}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 text-center py-6">No city location data available yet.</p>
            )}
          </div>
        </div>

        {/* Lead Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-600" />
              Lead Pipeline Status Distribution
            </span>
            <span className="text-xs font-normal text-slate-400">Pipeline Stages</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {charts.byStatus && charts.byStatus.map((st, i) => (
              <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-brand-300 transition-colors">
                <span className="text-slate-500 text-[11px] font-semibold">{st.status}</span>
                <span className="text-xl font-black text-slate-900 mt-1">{st.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
