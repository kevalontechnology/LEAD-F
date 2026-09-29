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
  ArrowUpRight
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
        Loading SaaS Dashboard...
      </div>
    );
  }

  const { cards, charts } = data || { cards: {}, charts: {} };

  const statCards = [
    { label: 'Total Leads', count: cards.totalLeads || 0, icon: Users, color: 'bg-blue-500', link: '/leads' },
    { label: 'New Leads', count: cards.newLeads || 0, icon: Sparkles, color: 'bg-indigo-500', link: '/leads?quickFilter=NOT_CONTACTED' },
    { label: 'Messages Ready', count: cards.messagesReady || 0, icon: MessageSquareText, color: 'bg-teal-500', link: '/leads?quickFilter=MESSAGE_READY' },
    { label: 'WhatsApp Sent', count: cards.whatsappSent || 0, icon: Send, color: 'bg-emerald-500', link: '/leads?quickFilter=WHATSAPP_SENT' },
    { label: 'Email Sent', count: cards.emailSent || 0, icon: Mail, color: 'bg-sky-500', link: '/leads?quickFilter=EMAIL_SENT' },
    { label: 'Failed Outreach', count: cards.failedCount || 0, icon: AlertTriangle, color: 'bg-red-500', link: '/leads?quickFilter=FAILED' },
    { label: "Today's Follow-ups", count: cards.followUpsToday || 0, icon: CalendarCheck, color: 'bg-purple-500', link: '/followups?tab=TODAY' },
    { label: 'Overdue Follow-ups', count: cards.overdueFollowUps || 0, icon: Clock, color: 'bg-amber-500', link: '/followups?tab=OVERDUE' },
    { label: 'Interested', count: cards.interestedLeads || 0, icon: ThumbsUp, color: 'bg-violet-500', link: '/leads?quickFilter=INTERESTED' },
    { label: 'Converted', count: cards.convertedLeads || 0, icon: CheckCircle2, color: 'bg-green-600', link: '/leads?quickFilter=CONVERTED' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-700/50">
        <div className="space-y-2">
          <span className="px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full text-xs font-semibold border border-brand-500/30">
            Kevalon Technology Outreach Hub
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Lead Management & Outreach Dashboard</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Import leads, review automatically generated category-aware outreach messages, select specific leads, and send WhatsApp & Emails with complete follow-up tracking.
          </p>
        </div>

        <button
          onClick={() => navigate('/import-leads')}
          className="px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all shrink-0 flex items-center gap-2"
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

      {/* Category & Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
            <span>Leads by Category</span>
            <span className="text-xs font-normal text-slate-400">Top Categories</span>
          </h3>

          <div className="space-y-3 text-xs">
            {charts.byCategory && charts.byCategory.length > 0 ? (
              charts.byCategory.map((cat, i) => {
                const percentage = cards.totalLeads ? Math.round((cat.count / cards.totalLeads) * 100) : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{cat.category}</span>
                      <span>{cat.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 text-center py-6">No category data available yet.</p>
            )}
          </div>
        </div>

        {/* Lead Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
            <span>Lead Status Breakdown</span>
            <span className="text-xs font-normal text-slate-400">Pipeline Stages</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {charts.byStatus && charts.byStatus.map((st, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <span className="text-slate-500 text-[11px] font-semibold">{st.status}</span>
                <span className="text-lg font-black text-slate-800 mt-1">{st.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
