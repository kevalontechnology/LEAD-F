import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Users,
  MessageSquareText,
  Send,
  Mail,
  AlertTriangle,
  CalendarCheck,
  Clock,
  ThumbsUp,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Filter,
  BarChart2,
  PieChart
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
    { label: 'New Leads', count: cards.newLeads || 0, icon: Sparkles, color: 'bg-indigo-600', link: '/leads?quickFilter=NOT_CONTACTED' },
    { label: 'Messages Ready', count: cards.messagesReady || 0, icon: MessageSquareText, color: 'bg-teal-600', link: '/leads?quickFilter=MESSAGE_READY' },
    { label: 'WhatsApp Sent', count: cards.whatsappSent || 0, icon: Send, color: 'bg-emerald-600', link: '/leads?quickFilter=WHATSAPP_SENT' },
    { label: 'Email Sent', count: cards.emailSent || 0, icon: Mail, color: 'bg-sky-600', link: '/leads?quickFilter=EMAIL_SENT' },
    { label: 'Failed Outreach', count: cards.failedCount || 0, icon: AlertTriangle, color: 'bg-red-600', link: '/leads?quickFilter=FAILED' },
    { label: "Today's Follow-ups", count: cards.followUpsToday || 0, icon: CalendarCheck, color: 'bg-purple-600', link: '/followups?tab=TODAY' },
    { label: 'Overdue Follow-ups', count: cards.overdueFollowUps || 0, icon: Clock, color: 'bg-amber-600', link: '/followups?tab=OVERDUE' },
    { label: 'Interested', count: cards.interestedLeads || 0, icon: ThumbsUp, color: 'bg-violet-600', link: '/leads?quickFilter=INTERESTED' },
    { label: 'Converted', count: cards.convertedLeads || 0, icon: CheckCircle2, color: 'bg-green-700', link: '/leads?quickFilter=CONVERTED' }
  ];

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
            Real-time breakdown of all lead categories, automated outreach messages, WhatsApp & Email sending stats, and complete follow-up tracking.
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
              Category-Wise Detailed Breakdown & Counts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact category lead count, ready messages, sent stats, and conversion percentage for all categories in database.
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
                  <th className="p-3 text-center">Message Ready</th>
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
                        <span className="bg-teal-50 text-teal-700 font-bold px-2.5 py-1 rounded-full border border-teal-200">
                          {cat.messageReady || 0}
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
