import React, { useState } from 'react';
import { X, Calendar, Clock, MessageSquare, Save } from 'lucide-react';
import { createFollowUpApi } from '../../services/followUpService';

const FollowUpModal = ({ isOpen, lead, onClose, onFollowUpCreated }) => {
  if (!isOpen || !lead) return null;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [followUpDate, setFollowUpDate] = useState(defaultDate);
  const [followUpTime, setFollowUpTime] = useState('10:00');
  const [channel, setChannel] = useState('WHATSAPP');
  const [followUpMessage, setFollowUpMessage] = useState(
    `Hi ${lead.contactPerson || lead.title}, following up regarding our technology delivery partnership proposal. Let me know if you had a chance to review!`
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createFollowUpApi({
        leadId: lead._id,
        followUpDate,
        followUpTime,
        channel,
        followUpMessage,
        notes
      });
      alert(`Follow-up scheduled for ${lead.title}!`);
      if (onFollowUpCreated) onFollowUpCreated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule follow-up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>Schedule Follow-up for {lead.title}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Follow-up Date</label>
              <input
                type="date"
                required
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Time</label>
              <input
                type="time"
                value={followUpTime}
                onChange={(e) => setFollowUpTime(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Outreach Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="WHATSAPP">WhatsApp</option>
              <option value="EMAIL">Email</option>
              <option value="CALL">Phone Call</option>
              <option value="MEETING">Meeting</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Follow-up Note / Draft</label>
            <textarea
              rows="3"
              value={followUpMessage}
              onChange={(e) => setFollowUpMessage(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Enter message text..."
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              Schedule Follow-up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FollowUpModal;
