import React from 'react';
import { AlertTriangle, Send, X, ShieldAlert } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  title = 'Confirm Action',
  description,
  selectedCount = 0,
  whatsappCount = 0,
  emailCount = 0,
  channel = 'WHATSAPP',
  onConfirm,
  onClose,
  loading = false
}) => {
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
            {description || 'Are you sure you want to proceed with sending outreach messages?'}
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Total Selected Leads:</span>
              <span className="font-bold text-slate-900 text-sm">{selectedCount}</span>
            </div>

            {(channel === 'WHATSAPP' || channel === 'BOTH') && (
              <div className="flex justify-between items-center text-xs text-slate-600 border-t border-slate-200/60 pt-1.5">
                <span>WhatsApp Dispatch:</span>
                <span className="font-semibold text-emerald-600">{whatsappCount || selectedCount}</span>
              </div>
            )}

            {(channel === 'EMAIL' || channel === 'BOTH') && (
              <div className="flex justify-between items-center text-xs text-slate-600 border-t border-slate-200/60 pt-1.5">
                <span>Email Dispatch:</span>
                <span className="font-semibold text-blue-600">{emailCount || selectedCount}</span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              Messages will be sent <strong>ONLY</strong> to the selected leads. Any leads marked as <strong>DO NOT CONTACT</strong> will be automatically blocked.
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
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
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
