import React from 'react';
import {
  Eye,
  Edit,
  MessageSquare,
  Mail,
  Copy,
  Calendar,
  RefreshCw,
  ExternalLink,
  ShieldOff
} from 'lucide-react';
import StatusBadge from '../common/Badge';
import { formatDate, truncateText } from '../../utils/formatters';

const LeadTable = ({
  leads = [],
  selectedLeadIds = [],
  onSelectLead,
  onSelectAllPage,
  onDeselectAll,
  allPageSelected = false,
  onViewLead,
  onEditLead,
  onSendWhatsApp,
  onSendEmail,
  onScheduleFollowUp,
  onRegenerateMessage,
  loading = false
}) => {
  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Select Bar Info */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-50/80 border-b border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={allPageSelected}
            onChange={onSelectAllPage}
            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
          />
          <span className="font-semibold text-slate-700">Select Page All</span>
          {selectedLeadIds.length > 0 && (
            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 font-bold">
              Selected: {selectedLeadIds.length} Leads
            </span>
          )}
        </div>

        {selectedLeadIds.length > 0 && (
          <button
            onClick={onDeselectAll}
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
          >
            Deselect All
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <th className="py-3 px-4 w-10"></th>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">City</th>
              <th className="py-3 px-4">Website</th>
              <th className="py-3 px-4">Lead Status</th>
              <th className="py-3 px-4">WhatsApp</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Last Contacted</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              <tr>
                <td colSpan="11" className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
                    Loading Leads...
                  </div>
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="11" className="py-12 text-center text-slate-400">
                  No leads found. Try changing search filters or import an Excel file.
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead._id);
                const isDoNotContact = lead.leadStatus === 'DO_NOT_CONTACT';

                return (
                  <tr
                    key={lead._id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-brand-50/40' : ''
                    } ${isDoNotContact ? 'bg-red-50/30' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectLead(lead._id)}
                        className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                    </td>

                    {/* Company */}
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{lead.title}</span>
                        {isDoNotContact && (
                          <span title="Opted out of outreach" className="text-red-500">
                            <ShieldOff className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-600 font-medium">{lead.categoryName || 'General'}</td>

                    {/* Contact Info */}
                    <td className="py-3 px-4 text-slate-600">
                      <div>
                        <p className="font-medium text-slate-800">{lead.contactPerson || '—'}</p>
                        <p className="text-[11px] text-slate-500">{lead.phone || lead.email || 'No Contact'}</p>
                      </div>
                    </td>

                    {/* City */}
                    <td className="py-3 px-4 text-slate-600">{lead.city || '—'}</td>

                    {/* Website */}
                    <td className="py-3 px-4 text-slate-500">
                      {lead.website ? (
                        <a
                          href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-600 hover:underline flex items-center gap-1 font-medium"
                        >
                          {truncateText(lead.website, 20)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Lead Status */}
                    <td className="py-3 px-4">
                      <StatusBadge type="lead" value={lead.leadStatus} />
                    </td>

                    {/* WhatsApp Status */}
                    <td className="py-3 px-4">
                      <StatusBadge type="whatsapp" value={lead.whatsappStatus} />
                    </td>

                    {/* Email Status */}
                    <td className="py-3 px-4">
                      <StatusBadge type="email" value={lead.emailStatus} />
                    </td>

                    {/* Last Contacted */}
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {formatDate(lead.lastContactedAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Lead Details */}
                        <button
                          onClick={() => onViewLead(lead)}
                          title="View Lead Details"
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Lead */}
                        <button
                          onClick={() => onEditLead(lead)}
                          title="Edit Lead"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Copy WhatsApp Message */}
                        {lead.generatedWhatsAppMessage && (
                          <button
                            onClick={() => copyToClipboard(lead.generatedWhatsAppMessage, 'WhatsApp Message')}
                            title="Copy WhatsApp Message"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}

                        {/* Send WhatsApp */}
                        <button
                          onClick={() => onSendWhatsApp(lead)}
                          disabled={isDoNotContact || !lead.phone}
                          title={isDoNotContact ? 'Opted Out' : 'Send WhatsApp'}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors disabled:opacity-30"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {/* Send Email */}
                        <button
                          onClick={() => onSendEmail(lead)}
                          disabled={isDoNotContact || !lead.email}
                          title={isDoNotContact ? 'Opted Out' : 'Send Email'}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-30"
                        >
                          <Mail className="w-4 h-4" />
                        </button>

                        {/* Schedule Follow-up */}
                        <button
                          onClick={() => onScheduleFollowUp(lead)}
                          title="Schedule Follow-up"
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>

                        {/* Regenerate Message */}
                        <button
                          onClick={() => onRegenerateMessage(lead._id)}
                          title="Regenerate Personalized Message"
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTable;
