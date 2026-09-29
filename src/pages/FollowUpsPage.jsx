import React, { useState, useEffect } from 'react';
import { getFollowUpsApi, updateFollowUpApi } from '../services/followUpService';
import { bulkSendMessagesApi } from '../services/outreachService';
import { CalendarCheck, Clock, CheckCircle2, MessageSquare, Mail, AlertTriangle, Send } from 'lucide-react';
import StatusBadge from '../components/common/Badge';
import { formatDate } from '../utils/formatters';
import ConfirmationModal from '../components/common/ConfirmationModal';

const tabs = [
  { id: 'TODAY', label: "Today's Follow-ups" },
  { id: 'OVERDUE', label: 'Overdue Follow-ups' },
  { id: 'UPCOMING', label: 'Upcoming' },
  { id: 'COMPLETED', label: 'Completed' }
];

const FollowUpsPage = () => {
  const [activeTab, setActiveTab] = useState('TODAY');
  const [followUps, setFollowUps] = useState([]);
  const [counts, setCounts] = useState({ todayCount: 0, overdueCount: 0, upcomingCount: 0, completedCount: 0 });
  const [loading, setLoading] = useState(true);

  // Send Confirmation
  const [activeFollowUp, setActiveFollowUp] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [sendChannel, setSendChannel] = useState('WHATSAPP');

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const res = await getFollowUpsApi({ tab: activeTab });
      if (res.success) {
        setFollowUps(res.followUps);
        setCounts(res.counts);
      }
    } catch (err) {
      console.error('Failed to fetch follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [activeTab]);

  const handleMarkComplete = async (id) => {
    try {
      await updateFollowUpApi(id, { status: 'COMPLETED' });
      alert('Follow-up marked as completed!');
      fetchFollowUps();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update follow-up');
    }
  };

  const handleSendOutreach = (followUp, channel) => {
    setActiveFollowUp(followUp);
    setSendChannel(channel);
    setIsConfirmOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Follow-up Dashboard</h1>
        <p className="text-xs text-slate-500">
          Track and execute scheduled follow-up interactions with prospective clients.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold text-slate-500">
        {tabs.map((tab) => {
          let badgeCount = 0;
          if (tab.id === 'TODAY') badgeCount = counts.todayCount;
          if (tab.id === 'OVERDUE') badgeCount = counts.overdueCount;
          if (tab.id === 'UPCOMING') badgeCount = counts.upcomingCount;
          if (tab.id === 'COMPLETED') badgeCount = counts.completedCount;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 font-bold'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  tab.id === 'OVERDUE' && badgeCount > 0
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {badgeCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Follow-up Date</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Note / Draft</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">Loading Follow-ups...</td>
                </tr>
              ) : followUps.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">No follow-ups found in this view.</td>
                </tr>
              ) : (
                followUps.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.leadId?.title || 'Unknown Lead'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>
                        <p className="font-semibold">{item.leadId?.contactPerson || '—'}</p>
                        <p className="text-[11px] text-slate-400">{item.leadId?.phone || item.leadId?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {formatDate(item.followUpDate)} @ {item.followUpTime || '10:00'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {item.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'CANCELLED'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {item.followUpMessage || item.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleSendOutreach(item, 'WHATSAPP')}
                              title="Send Follow-up WhatsApp"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" /> WhatsApp
                            </button>

                            <button
                              onClick={() => handleSendOutreach(item, 'EMAIL')}
                              title="Send Follow-up Email"
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1"
                            >
                              <Mail className="w-3 h-3" /> Email
                            </button>

                            <button
                              onClick={() => handleMarkComplete(item._id)}
                              title="Mark as Completed"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Confirm Follow-up Outreach"
        description={`Send follow-up ${sendChannel} message to "${activeFollowUp?.leadId?.title}"?`}
        selectedCount={1}
        channel={sendChannel}
        onConfirm={async () => {
          if (!activeFollowUp?.leadId?._id) return;
          try {
            await bulkSendMessagesApi([activeFollowUp.leadId._id], sendChannel);
            await handleMarkComplete(activeFollowUp._id);
            alert('Follow-up message sent and marked complete!');
            setIsConfirmOpen(false);
            fetchFollowUps();
          } catch (err) {
            alert(err.response?.data?.message || 'Send failed');
          }
        }}
        onClose={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default FollowUpsPage;
