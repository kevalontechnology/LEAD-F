import React, { useState, useEffect } from 'react';
import { getTemplatesApi, createTemplateApi, updateTemplateApi, deleteTemplateApi } from '../services/templateService';
import { Plus, Edit, Trash2, FileCode, Check, Copy } from 'lucide-react';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Advertising',
    type: 'BOTH',
    whatsappContent: '',
    emailSubject: '',
    emailBody: '',
    isDefault: false
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await getTemplatesApi();
      if (res.success) {
        setTemplates(res.templates);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        title: template.title,
        category: template.category,
        type: template.type,
        whatsappContent: template.whatsappContent || '',
        emailSubject: template.emailSubject || '',
        emailBody: template.emailBody || '',
        isDefault: template.isDefault || false
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        title: '',
        category: 'Advertising',
        type: 'BOTH',
        whatsappContent: '',
        emailSubject: '',
        emailBody: '',
        isDefault: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await updateTemplateApi(editingTemplate._id, formData);
        alert('Template updated!');
      } else {
        await createTemplateApi(formData);
        alert('Template created!');
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save template');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      await deleteTemplateApi(id);
      fetchTemplates();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete template');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Message Template Management</h1>
          <p className="text-xs text-slate-500">
            Manage category-based outreach templates for WhatsApp and Email communications.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Template
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading Templates...</div>
      ) : templates.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200">
          No templates configured yet. Click "Create New Template" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((tpl) => (
            <div key={tpl._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-brand-600" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{tpl.title}</h3>
                    <p className="text-[11px] text-slate-500">{tpl.category} Category</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {tpl.isDefault && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Default
                    </span>
                  )}
                  <button
                    onClick={() => handleOpenModal(tpl)}
                    className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tpl._id)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {tpl.whatsappContent && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">WhatsApp Template</span>
                  <p className="text-xs font-mono text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-24 overflow-y-auto whitespace-pre-wrap">
                    {tpl.whatsappContent}
                  </p>
                </div>
              )}

              {tpl.emailBody && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Email Subject & Body</span>
                  <p className="text-xs font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    Subject: {tpl.emailSubject}
                  </p>
                  <p className="text-xs font-mono text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-24 overflow-y-auto whitespace-pre-wrap">
                    {tpl.emailBody}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-100 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b pb-3">
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700">Template Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50"
                  >
                    <option value="Advertising">Advertising</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Branding">Branding</option>
                    <option value="IT / Web">IT / Web</option>
                    <option value="General">General</option>
                    <option value="Follow Up">Follow Up</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">WhatsApp Message Content</label>
                <textarea
                  rows="4"
                  value={formData.whatsappContent}
                  onChange={(e) => setFormData({ ...formData, whatsappContent: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 font-mono"
                  placeholder="Supports variables {{companyName}}, {{category}}, {{city}}..."
                ></textarea>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Email Subject</label>
                <input
                  type="text"
                  value={formData.emailSubject}
                  onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Email Body</label>
                <textarea
                  rows="5"
                  value={formData.emailBody}
                  onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 font-mono"
                  placeholder="Supports variables..."
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
                <label htmlFor="isDefault" className="font-semibold text-slate-700">
                  Set as default template for this category
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
