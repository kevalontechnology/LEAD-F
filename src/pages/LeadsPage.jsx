import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LeadTable from '../components/leads/LeadTable';
import LeadDetailsModal from '../components/leads/LeadDetailsModal';
import FollowUpModal from '../components/followups/FollowUpModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Pagination from '../components/common/Pagination';
import { getLeadsApi, bulkDeleteLeadsApi, regenerateLeadMessageApi } from '../services/leadService';
import { bulkSendMessagesApi, sendEmailApi } from '../services/outreachService';
import { Search, MessageSquare, Mail, Send, Trash2, Upload, Filter, RotateCcw, X } from 'lucide-react';

const quickFilterTabs = [
  { id: 'ALL', label: 'All Leads' },
  { id: 'HAS_EMAIL', label: '📧 Email Available' },
  { id: 'HAS_MOBILE', label: '📱 Mobile Available' },
  { id: 'HAS_BOTH', label: '⚡ Both Available' },
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State synced with URL searchParams
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedLeadStatus, setSelectedLeadStatus] = useState(searchParams.get('leadStatus') || '');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState(searchParams.get('quickFilter') || 'ALL');

  // Sync state when searchParams change (e.g. from header search or dashboard links)
  useEffect(() => {
    const s = searchParams.get('search');
    const c = searchParams.get('category');
    const q = searchParams.get('quickFilter');
    if (s !== null && s !== undefined) setSearch(s);
    if (c !== null && c !== undefined) setSelectedCategory(c);
    if (q !== null && q !== undefined) setSelectedQuickFilter(q);
  }, [searchParams]);

  // Lead Selection
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);

  // Modals State
  const [activeLead, setActiveLead] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [sendChannel, setSendChannel] = useState('WHATSAPP');
  const [bulkFilter, setBulkFilter] = useState(null);
  const [pendingEmailContent, setPendingEmailContent] = useState(null);
  const [sending, setSending] = useState(false);

  const handleInitiateBulkFilterSend = (channelType, filterType) => {
    setActiveLead(null);
    setSendChannel(channelType);
    setBulkFilter(filterType);
    setIsConfirmOpen(true);
  };

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

  const handleSendSingleWhatsApp = async (lead) => {
    setActiveLead(lead);
    setSelectedLeadIds([lead._id]);
    setSendChannel('WHATSAPP');
    setIsConfirmOpen(true);
  };

  const handleSendSingleEmail = async (lead, customSubject, customBody) => {
    setActiveLead(lead);
    setSelectedLeadIds([lead._id]);
    setSendChannel('EMAIL');
    setPendingEmailContent(
      customSubject !== undefined || customBody !== undefined
        ? { leadId: lead._id, subject: customSubject, body: customBody }
        : null
    );
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
    try {
      setSending(true);

      if (sendChannel === 'EMAIL' && pendingEmailContent) {
        const res = await sendEmailApi(
          pendingEmailContent.leadId,
          pendingEmailContent.subject,
          pendingEmailContent.body
        );
        const emailResult = res.result;

        if (emailResult?.success) {
          alert(`Email sent to ${emailResult.leadTitle} as Sales Executive!`);
        } else {
          alert(emailResult?.error || 'Email sending failed');
        }

        setIsConfirmOpen(false);
        setSelectedLeadIds([]);
        setPendingEmailContent(null);
        setBulkFilter(null);
        fetchLeads();
        return;
      }

      const isAllDb = selectedLeadIds.length === 0 || bulkFilter !== null;

      const res = await bulkSendMessagesApi(
        selectedLeadIds,
        sendChannel,
        selectedLeadIds.length === 0 ? (bulkFilter || (sendChannel === 'EMAIL' ? 'HAS_EMAIL' : 'HAS_MOBILE')) : undefined,
        selectedCategory,
        isAllDb
      );

      if (res.success) {
        alert(
          `Sales Executive Outreach Complete!\nChannel: ${sendChannel}\nSuccess: ${res.sentCount} leads\nFailed: ${res.failedCount}\nSkipped (DO_NOT_CONTACT): ${res.skippedDoNotContactCount}`
        );
        setIsConfirmOpen(false);
        setSelectedLeadIds([]);
        setBulkFilter(null);
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
    <div className="space-y-6 animate-fade-in relative pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Leads CRM</h1>
          <p className="text-xs text-slate-500">
            Review generated category messages, select leads, and send WhatsApp & Emails.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleInitiateBulkFilterSend('EMAIL', 'HAS_EMAIL')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            title="Bulk Send Brevo Emails to All Leads with Email Available as Sales Executive"
          >
            <Mail className="w-4 h-4" />
            Send Bulk Email (Sales)
          </button>

          <button
            onClick={() => handleInitiateBulkFilterSend('WHATSAPP', 'HAS_MOBILE')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            title="Bulk Send WhatsApp to All Leads with Mobile Available as Sales Executive"
          >
            <MessageSquare className="w-4 h-4" />
            Send Bulk WhatsApp (Sales)
          </button>

          <button
            onClick={() => navigate('/import-leads')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            fetchLeads();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1"
        >
          <div className="relative flex-1 sm:max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search company, phone, email, city, category..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-800 placeholder-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  title="Clear search text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 w-full sm:w-auto"
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
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 w-full sm:w-auto"
            >
              <option value="">All Cities</option>
              {cities.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {(search || selectedCategory || selectedCity || selectedQuickFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('');
                  setSelectedCity('');
                  setSelectedQuickFilter('ALL');
                  setPage(1);
                  navigate('/leads');
                }}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Selected Leads Floating/Inline Bulk Toolbar */}
      {selectedLeadIds.length > 0 && (
        <div className="sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 animate-slide-up">
          <span className="font-bold text-xs text-brand-300">
            Selected Leads ({selectedLeadIds.length})
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSendChannel('WHATSAPP');
                setIsConfirmOpen(true);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 text-xs shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Send WhatsApp
            </button>

            <button
              onClick={() => {
                setSendChannel('EMAIL');
                setIsConfirmOpen(true);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 text-xs shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" /> Send Email
            </button>

            <button
              onClick={() => {
                setSendChannel('BOTH');
                setIsConfirmOpen(true);
              }}
              className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold flex items-center gap-1.5 text-xs shadow-xs"
            >
              <Send className="w-3.5 h-3.5" /> Send Both
            </button>

            <button
              onClick={handleBulkDelete}
              className="p-1.5 text-red-400 hover:text-red-200 hover:bg-red-950/60 rounded-lg ml-1"
              title="Delete Selected Leads"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
        onSendWhatsApp={(lead) => {
          setIsDetailsOpen(false);
          handleSendSingleWhatsApp(lead);
        }}
        onSendEmail={(lead, subject, body) => {
          setIsDetailsOpen(false);
          handleSendSingleEmail(lead, subject, body);
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
        title="Confirm Outreach Action"
        description={
          (selectedLeadIds.length === 0 || bulkFilter !== null)
            ? `You are about to initiate bulk ${sendChannel} outreach to ALL ${total} matching lead(s) in the database across ALL pages.`
            : `You are about to initiate outreach to ${selectedLeadIds.length} selected lead(s). Messages will NOT be sent to any unselected or DO_NOT_CONTACT leads.`
        }
        selectedCount={selectedLeadIds.length}
        totalDatabaseCount={total}
        isAllDatabase={selectedLeadIds.length === 0 || bulkFilter !== null}
        channel={sendChannel}
        onConfirm={handleConfirmSend}
        onClose={() => {
          setIsConfirmOpen(false);
          setPendingEmailContent(null);
          setBulkFilter(null);
        }}
        loading={sending}
      />
    </div>
  );
};

export default LeadsPage;
