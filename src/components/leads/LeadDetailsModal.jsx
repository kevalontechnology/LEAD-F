import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  Phone,
  Mail,
  Globe,
  MapPin,
  MessageSquare,
  Send,
  Copy,
  Save,
  Clock,
  ShieldOff,
  Sparkles
} from 'lucide-react';
import StatusBadge from '../common/Badge';
import { updateLeadMessageApi, regenerateLeadMessageApi } from '../../services/leadService';
import api from '../../services/api';
import { formatDateTime } from '../../utils/formatters';

const LeadDetailsModal = ({
  isOpen,
  lead,
  onClose,
  onSendWhatsApp,
  onSendEmail,
  onLeadUpdated
}) => {
  if (!isOpen || !lead) return null;

  const [whatsappMsg, setWhatsappMsg] = useState(lead.generatedWhatsAppMessage || '');
  const [emailSubject, setEmailSubject] = useState(lead.generatedEmailSubject || '');
  const [emailBody, setEmailBody] = useState(lead.generatedEmailBody || '');
  const [timeline, setTimeline] = useState([]);
  const [savingMsgs, setSavingMsgs] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');

  useEffect(() => {
    setWhatsappMsg(lead.generatedWhatsAppMessage || '');
    setEmailSubject(lead.generatedEmailSubject || '');
    setEmailBody(lead.generatedEmailBody || '');

    // Fetch Timeline
    const fetchTimeline = async () => {
      try {
        const res = await api.get(`/communications/lead/${lead._id}`);
        if (res.data.success) {
          setTimeline(res.data.timeline || []);
        }
      } catch (err) {
        console.error('Failed to load timeline:', err);
      }
    };

    fetchTimeline();
  }, [lead]);

  const handleSaveMessages = async () => {
    try {
      setSavingMsgs(true);
      await updateLeadMessageApi(lead._id, {
        generatedWhatsAppMessage: whatsappMsg,
        generatedEmailSubject: emailSubject,
        generatedEmailBody: emailBody
      });
      alert('Messages saved successfully!');
      if (onLeadUpdated) onLeadUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save messages');
    } finally {
      setSavingMsgs(false);
    }
  };

  const handleRegenerate = async (persona = 'CEO') => {
    try {
      setRegenerating(true);
      const res = await regenerateLeadMessageApi(lead._id, persona);
      if (res.success && res.lead) {
        setWhatsappMsg(res.lead.generatedWhatsAppMessage);
        setEmailSubject(res.lead.generatedEmailSubject);
        setEmailBody(res.lead.generatedEmailBody);
        alert(`Personalized message regenerated for ${persona === 'CEO' ? 'CEO - Harsh Kothari' : 'Sales - Varun'}!`);
        if (onLeadUpdated) onLeadUpdated();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to regenerate message');
    } finally {
      setRegenerating(false);
    }
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`Copied ${label} to clipboard!`);
  };

  const isDoNotContact = lead.leadStatus === 'DO_NOT_CONTACT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg">
              {lead.title ? lead.title.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{lead.title}</h2>
                {isDoNotContact && (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold flex items-center gap-1">
                    <ShieldOff className="w-3 h-3" />
                    Do Not Contact
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {lead.categoryName || 'General Category'} • {lead.city || 'Location N/A'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Overview Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-3 bg-slate-100/60 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Lead Status:</span>
            <StatusBadge type="lead" value={lead.leadStatus} />
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">WhatsApp:</span>
            <StatusBadge type="whatsapp" value={lead.whatsappStatus} />
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Email:</span>
            <StatusBadge type="email" value={lead.emailStatus} />
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Last Contacted:</span>
            <span className="font-semibold text-slate-700">
              {lead.lastContactedAt ? formatDateTime(lead.lastContactedAt) : 'Never'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 gap-6 text-xs font-semibold text-slate-500 bg-white">
          <button
            onClick={() => setActiveTab('messages')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'messages'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            Outreach Messages
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            Company & Contact Info
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            Communication History
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px]">
              {timeline.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-brand-50/60 p-3 rounded-xl border border-brand-100">
                <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  Regenerate Pitch by Sender Persona:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRegenerate('CEO')}
                    disabled={regenerating}
                    className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs disabled:opacity-50"
                  >
                    👑 CEO (Harsh Kothari)
                  </button>
                  <button
                    onClick={() => handleRegenerate('SALES')}
                    disabled={regenerating}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs disabled:opacity-50"
                  >
                    💼 Sales (Varun)
                  </button>
                </div>
              </div>

              {/* Side-by-side WhatsApp & Email Editors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* WhatsApp Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      Generated WhatsApp Message
                    </span>
                    <button
                      onClick={() => copyText(whatsappMsg, 'WhatsApp Message')}
                      className="text-slate-500 hover:text-emerald-700 text-[11px] font-medium flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>

                  <textarea
                    rows="12"
                    value={whatsappMsg}
                    onChange={(e) => setWhatsappMsg(e.target.value)}
                    className="w-full text-xs font-mono p-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Generated WhatsApp message..."
                  ></textarea>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <button
                      onClick={handleSaveMessages}
                      disabled={savingMsgs}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg flex items-center gap-1 border border-slate-300"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Edits
                    </button>
                    <button
                      onClick={() => onSendWhatsApp(lead, whatsappMsg)}
                      disabled={isDoNotContact || !lead.phone}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" /> Send WhatsApp
                    </button>
                  </div>
                </div>

                {/* Email Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs text-blue-800 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-blue-600" />
                      Generated Email Subject & Body
                    </span>
                    <button
                      onClick={() => copyText(`Subject: ${emailSubject}\n\n${emailBody}`, 'Email Message')}
                      className="text-slate-500 hover:text-blue-700 text-[11px] font-medium flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 flex-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Body</label>
                    <textarea
                      rows="9"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full text-xs font-mono p-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Generated email body..."
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <button
                      onClick={handleSaveMessages}
                      disabled={savingMsgs}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg flex items-center gap-1 border border-slate-300"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Edits
                    </button>
                    <button
                      onClick={() => onSendEmail(lead, emailSubject, emailBody)}
                      disabled={isDoNotContact || !lead.email}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Building className="w-4 h-4 text-brand-600" />
                  Company Details
                </h3>
                <p><span className="text-slate-400">Title:</span> <strong>{lead.title}</strong></p>
                <p><span className="text-slate-400">Category:</span> <strong>{lead.categoryName || 'General'}</strong></p>
                <p><span className="text-slate-400">Website:</span> <strong>{lead.website || 'N/A'}</strong></p>
                <p><span className="text-slate-400">Address:</span> <strong>{lead.address || 'N/A'}</strong></p>
                <p><span className="text-slate-400">City / State:</span> <strong>{lead.city || 'N/A'}, {lead.state || 'N/A'}</strong></p>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Contact Information
                </h3>
                <p><span className="text-slate-400">Contact Person:</span> <strong>{lead.contactPerson || 'N/A'}</strong></p>
                <p><span className="text-slate-400">Phone:</span> <strong>{lead.phone || 'N/A'}</strong></p>
                <p><span className="text-slate-400">Email:</span> <strong>{lead.email || 'N/A'}</strong></p>
                <p><span className="text-slate-400">Source:</span> <strong>{lead.source || 'Excel Import'}</strong></p>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Communication Timeline
              </h3>
              {timeline.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs">
                  No outreach history logged yet for this lead.
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-200 pl-6 space-y-6 ml-3">
                  {timeline.map((item) => (
                    <div key={item._id} className="relative group">
                      <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-brand-600 border-2 border-white shadow-xs"></div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 flex items-center gap-2">
                            {item.channel === 'WHATSAPP' ? (
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Mail className="w-3.5 h-3.5 text-blue-600" />
                            )}
                            {item.channel} OUTREACH
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(item.sentAt)}
                          </span>
                        </div>
                        {item.subject && (
                          <p className="font-semibold text-slate-800">Subject: {item.subject}</p>
                        )}
                        <p className="text-slate-600 whitespace-pre-wrap font-mono bg-white p-3 rounded-lg border border-slate-200">
                          {item.message}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>Status: <strong className="text-emerald-700">{item.status}</strong></span>
                          <span>By: {item.createdBy?.name || 'System User'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;
