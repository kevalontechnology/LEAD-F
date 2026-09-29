import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, MessageSquare, Mail, Phone, Clock } from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

const CommunicationsPage = () => {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComms = async () => {
      try {
        const res = await api.get('/communications');
        if (res.data.success) {
          setCommunications(res.data.communications);
        }
      } catch (err) {
        console.error('Failed to fetch communications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComms();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Communication Audit History</h1>
        <p className="text-xs text-slate-500">
          Complete log of all WhatsApp, Email, and manual outreach attempts stored in MongoDB.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Company Lead</th>
                <th className="py-3 px-4">Subject / Context</th>
                <th className="py-3 px-4">Message Excerpt</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Sent By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">Loading History...</td>
                </tr>
              ) : communications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">No communication logs recorded yet.</td>
                </tr>
              ) : (
                communications.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {formatDateTime(item.sentAt)}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span className="flex items-center gap-1.5">
                        {item.channel === 'WHATSAPP' ? (
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Mail className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        {item.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {item.leadId?.title || 'Lead Deleted'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {item.subject || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px] max-w-xs truncate">
                      {item.message}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'SENT' || item.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {item.createdBy?.name || 'System'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommunicationsPage;
