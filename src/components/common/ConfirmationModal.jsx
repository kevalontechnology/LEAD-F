import React, { useState } from 'react';
import { AlertTriangle, Send, X, ShieldAlert, UserCheck, Crown, Briefcase } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  title = 'Confirm Outreach Action',
  description,
  selectedCount = 0,
  totalDatabaseCount = 0,
  isAllDatabase = false,
  whatsappCount = 0,
  emailCount = 0,
  channel = 'WHATSAPP',
  onConfirm,
  onClose,
  loading = false
}) => {
  const [senderPersona, setSenderPersona] = useState('SALES'); // 'SALES' or 'CEO'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 transform transition-all scale-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-brand-700 font-bold text-base">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            {description || (isAllDatabase
              ? `Are you sure you want to proceed with bulk outreach to ALL ${totalDatabaseCount || 'matching'} lead(s) in the database across ALL pages?`
              : 'Are you sure you want to proceed with sending outreach messages?')}
          </p>

          {/* Sender Persona Selection */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-brand-600" />
                Select Sender Persona (મેસેજ મોકલનાર):
              </span>
              <span className="text-[10px] text-brand-600 font-bold">2 Personas Available</span>
            </label>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setSenderPersona('CEO')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  senderPersona === 'CEO'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs font-bold flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  Harsh Kothari
                </span>
                <span className={`text-[10px] mt-1 ${senderPersona === 'CEO' ? 'text-brand-100' : 'text-slate-500'}`}>
                  CEO & Founder
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSenderPersona('SALES')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  senderPersona === 'SALES'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs font-bold flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-sky-300" />
                  Varun
                </span>
                <span className={`text-[10px] mt-1 ${senderPersona === 'SALES' ? 'text-brand-100' : 'text-slate-500'}`}>
                  Sales Executive
                </span>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span className="font-semibold text-slate-800">
                {isAllDatabase ? 'Total Database Leads (All Pages):' : 'Total Selected Leads:'}
              </span>
              <span className="font-bold text-brand-700 text-sm">
                {isAllDatabase ? totalDatabaseCount : selectedCount}
              </span>
            </div>

            {(channel === 'WHATSAPP' || channel === 'BOTH') && (
              <div className="flex justify-between items-center text-xs text-slate-600 border-t border-slate-200/60 pt-1.5">
                <span>WhatsApp Dispatch Scope:</span>
                <span className="font-semibold text-emerald-600">
                  {isAllDatabase ? `All Database Leads (${totalDatabaseCount})` : (whatsappCount || selectedCount)}
                </span>
              </div>
            )}

            {(channel === 'EMAIL' || channel === 'BOTH') && (
              <div className="flex justify-between items-center text-xs text-slate-600 border-t border-slate-200/60 pt-1.5">
                <span>Email Dispatch Scope:</span>
                <span className="font-semibold text-blue-600">
                  {isAllDatabase ? `All Database Leads (${totalDatabaseCount})` : (emailCount || selectedCount)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              {isAllDatabase
                ? `Bulk outreach will be sent to ALL matching leads in the database across ALL pages. Any leads marked as DO NOT CONTACT will be automatically skipped.`
                : `Messages will be sent ONLY to the selected leads. Any leads marked as DO NOT CONTACT will be automatically blocked.`}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(senderPersona)}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Confirm & Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
