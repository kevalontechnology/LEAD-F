import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LeadTable from '../components/leads/LeadTable';
import LeadDetailsModal from '../components/leads/LeadDetailsModal';
import FollowUpModal from '../components/followups/FollowUpModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Pagination from '../components/common/Pagination';
import { getLeadsApi, bulkDeleteLeadsApi, regenerateLeadMessageApi } from '../services/leadService';
import { sendWhatsAppApi, sendEmailApi, bulkSendMessagesApi } from '../services/outreachService';
import { Search, Filter, MessageSquare, Mail, Send, Trash2, Plus, Upload } from 'lucide-react';

const quickFilterTabs = [
  { id: 'ALL', label: 'All Leads' },
  { id: 'NOT_CONTACTED', label: 'Not Contacted' },
  { id: 'MESSAGE_READY', label: 'Message Ready' },
  { id: 'WHATSAPP_SENT', label: 'WhatsApp Sent' },
  { id: 'EMAIL_SENT', label: 'Email Sent' },
  { id: 'FAILED', label: 'Failed' },
  { id: 'FOLLOW_UP_DUE', label: 'Follow-up Due' },
  { id: 'INTERESTED', label: 'Interested' },
  { id: 'CONVERTED', label: 'Converted' }
];

const LeadsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedLeadStatus, setSelectedLeadStatus] = useState('');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState(searchParams.get('quickFilter') || 'ALL');

  // Lead Selection
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);

  // Modals State
  const [activeLead, setActiveLead] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [sendChannel, setSendChannel] = useState('WHATSAPP');
  const [sending, setSending] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        search,
        category: selectedCategory,
        city: selectedCity,
        leadStatus: selectedLeadStatus,
        quickFilter: selectedQuickFilter !== 'ALL' ? selectedQuickFilter : undefined
      };
      const res = await getLeadsApi(params);
      if (res.success) {
        setLeads(res.leads);
        setTotal(res.total);
        setPages(res.pages);
        setCategories(res.categories || []);
        setCities(res.cities || []);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, search, selectedCategory, selectedCity, selectedLeadStatus, selectedQuickFilter]);

  // Selection Handlers
  const handleSelectLead = (id) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((item) => item !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const handleSelectAllPage = () => {
    const pageIds = leads.map((l) => l._id);
    const allSelected = pageIds.every((id) => selectedLeadIds.includes(id));
    if (allSelected) {
      setSelectedLeadIds(selectedLeadIds.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedLeadIds(Array.from(new Set([...selectedLeadIds, ...pageIds])));
    }
  };

  const handleDeselectAll = () => {
    setSelectedLeadIds([]);
  };

  // Single Action Triggers
  const handleViewLead = (lead) => {
    setActiveLead(lead);
    setIsDetailsOpen(true);
  };

  const handleSendSingleWhatsApp = async (lead, customMsg) => {
    setActiveLead(lead);
    setSelectedLeadIds([lead._id]);
    setSendChannel('WHATSAPP');
    setIsConfirmOpen(true);
  };

  const handleSendSingleEmail = async (lead, customSubject, customBody) => {
    setActiveLead(lead);
    setSelectedLeadIds([lead._id]);
    setSendChannel('EMAIL');
    setIsConfirmOpen(true);
  };

  const handleScheduleFollowUp = (lead) => {
    setActiveLead(lead);
    setIsFollowUpOpen(true);
  };

  const handleRegenerateMessage = async (leadId) => {
    try {
      await regenerateLeadMessageApi(leadId);
      alert('Message regenerated based on lead category!');
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to regenerate message');
    }
  };

  // Bulk Action Confirmation Execution
  const handleConfirmSend = async () => {
    if (selectedLeadIds.length === 0) return;

    try {
      setSending(true);
      const res = await bulkSendMessagesApi(selectedLeadIds, sendChannel);
      if (res.success) {
        alert(
          `Outreach Complete!\nSuccess: ${res.sentCount} leads\nFailed: ${res.failedCount}\nSkipped (DO_NOT_CONTACT): ${res.skippedDoNotContactCount}`
        );
        setIsConfirmOpen(false);
        setSelectedLeadIds([]);
        fetchLeads();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Bulk sending failed');
    } finally {
      setSending(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeadIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedLeadIds.length} leads?`)) return;

    try {
      await bulkDeleteLeadsApi(selectedLeadIds);
      alert('Leads deleted successfully');
      setSelectedLeadIds([]);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete leads');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Leads & Outreach Management</h1>
          <p className="text-xs text-slate-500">
            Review generated category messages, manually select leads, and confirm sending.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/import-leads')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </button>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {quickFilterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedQuickFilter(tab.id);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedQuickFilter === tab.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search company, phone, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-700"
          >
            <option value="">All Categories</option>
            {categories.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setPage(1);
            }}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-700"
          >
            <option value="">All Cities</option>
            {cities.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Leads Bulk Toolbar */}
        {selectedLeadIds.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-md animate-fade-in">
            <span className="font-bold text-xs text-brand-300 mr-2">
              Selected ({selectedLeadIds.length})
            </span>
            <button
              onClick={() => {
                setSendChannel('WHATSAPP');
                setIsConfirmOpen(true);
              }}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 text-[11px]"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Send WhatsApp
            </button>

            <button
              onClick={() => {
                setSendChannel('EMAIL');
                setIsConfirmOpen(true);
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1 text-[11px]"
            >
              <Mail className="w-3.5 h-3.5" /> Send Email
            </button>

            <button
              onClick={() => {
                setSendChannel('BOTH');
                setIsConfirmOpen(true);
              }}
              className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold flex items-center gap-1 text-[11px]"
            >
              <Send className="w-3.5 h-3.5" /> Send Both
            </button>

            <button
              onClick={handleBulkDelete}
              className="p-1.5 text-red-400 hover:text-red-200 hover:bg-red-950/50 rounded-lg ml-2"
              title="Delete Selected Leads"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Lead Table */}
      <LeadTable
        leads={leads}
        selectedLeadIds={selectedLeadIds}
        onSelectLead={handleSelectLead}
        onSelectAllPage={handleSelectAllPage}
        onDeselectAll={handleDeselectAll}
        allPageSelected={
          leads.length > 0 && leads.every((l) => selectedLeadIds.includes(l._id))
        }
        onViewLead={handleViewLead}
        onEditLead={handleViewLead}
        onSendWhatsApp={(lead) => handleSendSingleWhatsApp(lead)}
        onSendEmail={(lead) => handleSendSingleEmail(lead)}
        onScheduleFollowUp={handleScheduleFollowUp}
        onRegenerateMessage={handleRegenerateMessage}
        loading={loading}
      />

      {/* Pagination */}
      <Pagination page={page} totalPages={pages} totalCount={total} onPageChange={setPage} />

      {/* Details Modal */}
      <LeadDetailsModal
        isOpen={isDetailsOpen}
        lead={activeLead}
        onClose={() => setIsDetailsOpen(false)}
        onSendWhatsApp={(lead, msg) => {
          setIsDetailsOpen(false);
          handleSendSingleWhatsApp(lead, msg);
        }}
        onSendEmail={(lead, subj, body) => {
          setIsDetailsOpen(false);
          handleSendSingleEmail(lead, subj, body);
        }}
        onLeadUpdated={fetchLeads}
      />

      {/* Follow-up Modal */}
      <FollowUpModal
        isOpen={isFollowUpOpen}
        lead={activeLead}
        onClose={() => setIsFollowUpOpen(false)}
        onFollowUpCreated={fetchLeads}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Confirm Manual Outreach"
        description={`You are about to initiate outreach to ${selectedLeadIds.length} selected lead(s). Messages will NOT be sent to any unselected or DO_NOT_CONTACT leads.`}
        selectedCount={selectedLeadIds.length}
        channel={sendChannel}
        onConfirm={handleConfirmSend}
        onClose={() => setIsConfirmOpen(false)}
        loading={sending}
      />
    </div>
  );
};

export default LeadsPage;
