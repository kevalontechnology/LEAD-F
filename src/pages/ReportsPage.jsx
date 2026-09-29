import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart3, PieChart, TrendingUp, Users, ArrowUpRight } from 'lucide-react';

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <div className="py-12 text-center text-xs text-slate-400">Loading Reports & Analytics...</div>;

  const { cards = {}, charts = {} } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Outreach Reports & Analytics</h1>
        <p className="text-xs text-slate-500">
          Conversion metrics, category distributions, and channel performance for Kevalon Technology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Outreach Deliverability Rate</span>
          <div className="text-3xl font-black text-emerald-600">
            {cards.totalLeads ? Math.round(((cards.whatsappSent + cards.emailSent) / (cards.totalLeads * 2)) * 100) : 0}%
          </div>
          <p className="text-[11px] text-slate-400">Calculated across WhatsApp & Email sends</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Positive Intent Ratio</span>
          <div className="text-3xl font-black text-brand-600">
            {cards.totalLeads ? Math.round(((cards.interestedLeads + cards.convertedLeads) / cards.totalLeads) * 100) : 0}%
          </div>
          <p className="text-[11px] text-slate-400">Interested + Converted vs Total Imported Leads</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Total Leads In Database</span>
          <div className="text-3xl font-black text-slate-900">{cards.totalLeads || 0}</div>
          <p className="text-[11px] text-slate-400">Leads saved across all Excel imports</p>
        </div>
      </div>

      {/* Top Cities */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900">Leads Distribution by City</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {charts.byCity && charts.byCity.map((c, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px] font-semibold">{c.city || 'Other'}</span>
              <span className="text-xl font-black text-slate-900 block mt-1">{c.count} Leads</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
