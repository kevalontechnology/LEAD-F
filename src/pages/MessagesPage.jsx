import React, { useState, useEffect } from 'react';
import { getLeadsApi } from '../services/leadService';
import { MessageSquare, Mail, Copy, Eye, Send } from 'lucide-react';
import StatusBadge from '../components/common/Badge';
import LeadDetailsModal from '../components/leads/LeadDetailsModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { bulkSendMessagesApi } from '../services/outreachService';

const MessagesPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLead, setActiveLead] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [sendChannel, setSendChannel] = useState('WHATSAPP');

  const fetchMessagesData = async () => {
    try {
      setLoading(true);
      const res = await getLeadsApi({ limit: 50 });
      if (res.success) {
        setLeads(res.leads);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessagesData();
  }, []);

  const copyMessage = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Generated Message Library</h1>
        <p className="text-xs text-slate-500">
          Review and edit auto-generated category-specific WhatsApp and Email messages for each lead.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading Generated Messages...</div>
      ) : leads.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200">
          No generated messages found. Import leads from Excel to automatically generate outreach messages.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leads.map((lead) => (
            <div key={lead._id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{lead.title}</h3>
                  <p className="text-[11px] text-slate-500">{lead.categoryName} • {lead.city || 'Location N/A'}</p>
                </div>
                <StatusBadge type="lead" value={lead.leadStatus} />
              </div>

              {/* WhatsApp Preview */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Message
                  </span>
                  <button
                    onClick={() => copyMessage(lead.generatedWhatsAppMessage, 'WhatsApp Message')}
                    className="text-[10px] text-slate-400 hover:text-emerald-600 flex items-center gap-1 font-normal"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 max-h-28 overflow-y-auto whitespace-pre-wrap">
                  {lead.generatedWhatsAppMessage || 'No WhatsApp message generated.'}
                </div>
              </div>

              {/* Email Preview */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-blue-700">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Email Subject
                  </span>
                  <button
                    onClick={() => copyMessage(`Subject: ${lead.generatedEmailSubject}\n\n${lead.generatedEmailBody}`, 'Email')}
                    className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-1 font-normal"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <div className="text-xs font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  {lead.generatedEmailSubject || 'No Subject'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setActiveLead(lead);
                    setIsDetailsOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Review & Edit
                </button>
                <button
                  onClick={() => {
                    setActiveLead(lead);
                    setSendChannel('WHATSAPP');
                    setIsConfirmOpen(true);
                  }}
                  disabled={lead.leadStatus === 'DO_NOT_CONTACT' || !lead.phone}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" /> Send WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <LeadDetailsModal
        isOpen={isDetailsOpen}
        lead={activeLead}
        onClose={() => setIsDetailsOpen(false)}
        onSendWhatsApp={(l) => {
          setIsDetailsOpen(false);
          setActiveLead(l);
          setSendChannel('WHATSAPP');
          setIsConfirmOpen(true);
        }}
        onSendEmail={(l) => {
          setIsDetailsOpen(false);
          setActiveLead(l);
          setSendChannel('EMAIL');
          setIsConfirmOpen(true);
        }}
        onLeadUpdated={fetchMessagesData}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Confirm Send Message"
        description={`Send ${sendChannel} message to "${activeLead?.title}"?`}
        selectedCount={1}
        channel={sendChannel}
        onConfirm={async () => {
          if (!activeLead) return;
          try {
            await bulkSendMessagesApi([activeLead._id], sendChannel);
            alert('Message sent successfully!');
            setIsConfirmOpen(false);
            fetchMessagesData();
          } catch (err) {
            alert(err.response?.data?.message || 'Send failed');
          }
        }}
        onClose={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default MessagesPage;
