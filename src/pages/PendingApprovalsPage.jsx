import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, User } from 'lucide-react';

const PendingApprovalsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/approvals/pending');
      if (res.data.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch approval requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (id, leadTitle) => {
    if (!window.confirm(`Are you sure you want to APPROVE edits for "${leadTitle}"? Lead data will be updated.`)) return;

    try {
      setActionLoading(id);
      const res = await api.post(`/approvals/${id}/approve`);
      if (res.data.success) {
        alert(res.data.message || 'Approved successfully!');
        fetchApprovals();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id, leadTitle) => {
    const reason = window.prompt(`Enter rejection reason for "${leadTitle}":`, 'Rejected by Admin');
    if (reason === null) return;

    try {
      setActionLoading(id);
      const res = await api.post(`/approvals/${id}/reject`, { rejectionReason: reason });
      if (res.data.success) {
        alert(res.data.message || 'Request rejected!');
        fetchApprovals();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
        <span className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-2"></span>
        Loading Pending Approvals...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-600" />
            Sales Edit Approval Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review and approve/reject proposed lead updates requested by Sales representatives.
          </p>
        </div>

        <button
          onClick={fetchApprovals}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Pending Approval Requests</h3>
          <p className="text-xs text-slate-400">All sales edit requests have been reviewed and processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((reqItem) => {
            const proposed = reqItem.proposedChanges || {};
            const original = reqItem.originalData || {};

            return (
              <div
                key={reqItem._id}
                className="bg-white p-6 rounded-2xl border border-amber-200 shadow-xs space-y-4 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-[11px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Pending Approval
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{reqItem.leadTitle}</h3>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <User className="w-3.5 h-3.5" />
                    <span>Requested by: <strong className="text-slate-800">{reqItem.requestedByName}</strong></span>
                    <span>• {new Date(reqItem.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Side-by-side diff */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Data */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-600 block text-[11px] border-b border-slate-200 pb-1">
                      Original Data (Current DB State)
                    </span>
                    <div className="space-y-1 text-slate-700">
                      <p><strong>Title:</strong> {original.title || 'N/A'}</p>
                      <p><strong>Contact Person:</strong> {original.contactPerson || 'N/A'}</p>
                      <p><strong>Phone:</strong> {original.phone || 'N/A'}</p>
                      <p><strong>Email:</strong> {original.email || 'N/A'}</p>
                      <p><strong>Category:</strong> {original.categoryName || 'N/A'}</p>
                      <p><strong>City:</strong> {original.city || 'N/A'}</p>
                      <p><strong>Status:</strong> {original.leadStatus || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Proposed Changes */}
                  <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 space-y-1.5">
                    <span className="font-bold text-amber-900 block text-[11px] border-b border-amber-200 pb-1">
                      Sales Proposed Edits
                    </span>
                    <div className="space-y-1 text-slate-900 font-semibold">
                      {Object.keys(proposed).map((key) => {
                        const isDifferent = original[key] !== proposed[key];
                        return (
                          <p key={key} className={isDifferent ? 'text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded' : ''}>
                            <strong>{key}:</strong> {String(proposed[key] || 'N/A')}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => handleReject(reqItem._id, reqItem.leadTitle)}
                    disabled={actionLoading === reqItem._id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl border border-red-200 transition-all text-xs"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Request
                  </button>

                  <button
                    onClick={() => handleApprove(reqItem._id, reqItem.leadTitle)}
                    disabled={actionLoading === reqItem._id}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {actionLoading === reqItem._id ? 'Approving...' : 'Approve & Update Lead'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingApprovalsPage;
