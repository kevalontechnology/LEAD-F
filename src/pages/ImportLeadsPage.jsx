import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { previewExcelApi, confirmExcelImportApi } from '../services/leadService';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Table,
  Sliders
} from 'lucide-react';

const CRM_FIELDS = [
  { key: 'title', label: 'Company Name / Title (Required)' },
  { key: 'categoryName', label: 'Category / Industry' },
  { key: 'contactPerson', label: 'Contact Person' },
  { key: 'phone', label: 'Phone / Mobile' },
  { key: 'email', label: 'Email Address' },
  { key: 'city', label: 'City / Location' },
  { key: 'state', label: 'State' },
  { key: 'website', label: 'Website URL' },
  { key: 'address', label: 'Full Address' },
  { key: 'ignore', label: '(Ignore Column)' }
];

const DEFAULT_MAPS = {
  title: 'title',
  'company name': 'title',
  company: 'title',
  titlename: 'title',
  name: 'title',
  'business name': 'title',
  categoryname: 'categoryName',
  category: 'categoryName',
  industry: 'categoryName',
  business: 'categoryName',
  phone: 'phone',
  mobile: 'phone',
  contact: 'phone',
  'phone number': 'phone',
  'mobile number': 'phone',
  address: 'address',
  city: 'city',
  location: 'city',
  state: 'state',
  website: 'website',
  url: 'website',
  domain: 'website',
  email: 'email',
  'email address': 'email',
  'mail id': 'email',
  'contact person': 'contactPerson',
  owner: 'contactPerson'
};

const ImportLeadsPage = () => {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(1); // 1: Upload, 2: Column Mapper & Preview, 3: Success Summary
  const [previewData, setPreviewData] = useState(null);
  const [columnMapping, setColumnMapping] = useState({});
  const [detectedHeaders, setDetectedHeaders] = useState([]);
  const [duplicateAction, setDuplicateAction] = useState('SKIP');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  
  // Structured Import Result & DB Total
  const [importSummary, setImportSummary] = useState(null);
  const [databaseTotal, setDatabaseTotal] = useState(0);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAndPreview = async (e, customMap = null) => {
    if (e) e.preventDefault();
    if (!file) return alert('Please select an Excel or CSV file.');

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      if (customMap) {
        formData.append('mapping', JSON.stringify(customMap));
      }

      const res = await previewExcelApi(formData);
      if (res.success) {
        setPreviewData(res.preview);
        const headers = res.preview.detectedHeaders || [];
        setDetectedHeaders(headers);

        // Auto-initialize mapping if first time
        if (!customMap) {
          const initialMap = {};
          headers.forEach((h) => {
            const lowerH = h.toLowerCase().trim();
            initialMap[h] = DEFAULT_MAPS[lowerH] || 'ignore';
          });
          setColumnMapping(initialMap);
        }

        setStep(2);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to parse Excel file');
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (header, crmField) => {
    const updated = { ...columnMapping, [header]: crmField };
    setColumnMapping(updated);
  };

  const handleReapplyMapping = (e) => {
    handleUploadAndPreview(e, columnMapping);
  };

  const handleConfirmImport = async () => {
    if (!previewData || !previewData.previewList) return;

    try {
      setImporting(true);
      const recordsToImport = previewData.previewList.map((item) => item.record);

      const res = await confirmExcelImportApi({
        records: recordsToImport,
        duplicateAction
      });

      if (res.success) {
        setImportSummary(res.importSummary || {
          totalRows: previewData.totalRows,
          validRows: previewData.validRows,
          created: res.result?.importedCount || 0,
          updated: res.result?.updatedCount || 0,
          skipped: res.result?.skippedCount || 0,
          invalid: previewData.invalidRows || 0,
          duplicates: previewData.duplicateCount || 0
        });

        setDatabaseTotal(res.databaseTotal || 0);

        // Invalidate all lead & dashboard query caches in TanStack Query
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['reports'] });

        setStep(3);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete import');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-4">
      {/* Step Indicator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Excel / CSV Lead Import</h1>
          <p className="text-xs text-slate-500">
            Confirm column mapping for your uploaded file, resolve duplicates, and import leads.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            1. Upload
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            2. Column Mapping & Preview
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-3 py-1 rounded-full ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            3. Import Complete
          </span>
        </div>
      </div>

      {/* Step 1: Upload File */}
      {step === 1 && (
        <form onSubmit={(e) => handleUploadAndPreview(e)} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-8 text-center transition-colors bg-slate-50/50">
            <UploadCloud className="w-12 h-12 text-brand-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">Upload your Excel or CSV File</p>
            <p className="text-xs text-slate-500 mt-1">Supports .xlsx, .xls, and .csv formats</p>

            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block mt-4 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all"
            >
              Choose File
            </label>

            {file && (
              <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl text-xs text-brand-900 space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              Dynamic Column Mapping
            </p>
            <p className="text-[11px] text-slate-600">
              Any file column structure can be uploaded. In the next step, you will be able to confirm and map each column in your file to CRM fields.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!file || loading}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing File...
                </>
              ) : (
                <>
                  Parse Columns & Preview
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Column Mapper & Preview */}
      {step === 2 && previewData && (
        <div className="space-y-6">
          {/* Interactive Column Mapping Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-600" />
                Confirm Column Mapping for "{file?.name}"
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Detected Columns: {detectedHeaders.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {detectedHeaders.map((header, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block truncate" title={header}>
                    Excel Column: <span className="text-brand-700">{header}</span>
                  </span>
                  <select
                    value={columnMapping[header] || 'ignore'}
                    onChange={(e) => handleMappingChange(header, e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    {CRM_FIELDS.map((field) => (
                      <option key={field.key} value={field.key}>
                        ➜ {field.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleReapplyMapping}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Apply Custom Column Mapping
              </button>
            </div>
          </div>

          {/* Import Preview Stats */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-600" />
                Import Summary Preview
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">Total Excel Rows</span>
                <span className="text-xl font-black text-slate-900">{previewData.totalRows}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <span className="text-emerald-700 block font-medium">New Leads</span>
                <span className="text-xl font-black text-emerald-800">{previewData.newCount}</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <span className="text-amber-700 block font-medium">Duplicates</span>
                <span className="text-xl font-black text-amber-800">{previewData.duplicateCount}</span>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                <span className="text-rose-700 block font-medium">Invalid Email</span>
                <span className="text-xl font-black text-rose-800">{previewData.invalidEmailCount}</span>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                <span className="text-rose-700 block font-medium">Invalid Phone</span>
                <span className="text-xl font-black text-rose-800">{previewData.invalidPhoneCount}</span>
              </div>
            </div>

            {/* Duplicate Strategy */}
            {previewData.duplicateCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Duplicate Handling Action
                </h4>
                <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-700">
                  <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-200 cursor-pointer">
                    <input
                      type="radio"
                      name="dupAction"
                      value="SKIP"
                      checked={duplicateAction === 'SKIP'}
                      onChange={(e) => setDuplicateAction(e.target.value)}
                    />
                    <span>Skip Duplicates (Recommended)</span>
                  </label>
                  <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-200 cursor-pointer">
                    <input
                      type="radio"
                      name="dupAction"
                      value="UPDATE"
                      checked={duplicateAction === 'UPDATE'}
                      onChange={(e) => setDuplicateAction(e.target.value)}
                    />
                    <span>Update Existing Lead</span>
                  </label>
                  <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-200 cursor-pointer">
                    <input
                      type="radio"
                      name="dupAction"
                      value="FORCE"
                      checked={duplicateAction === 'FORCE'}
                      onChange={(e) => setDuplicateAction(e.target.value)}
                    />
                    <span>Import Anyway</span>
                  </label>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Upload Different File
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importing}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Importing & Generating Messages...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm & Import Leads into CRM
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Success Confirmation */}
      {step === 3 && importSummary && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Import Completed Successfully!</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All records mapped from your file have been processed. Messages are saved in status <strong className="text-brand-600">MESSAGE_READY</strong>.
            </p>
          </div>

          {/* Exact Required Import Summary Breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-md mx-auto text-xs space-y-2.5 text-left">
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-600 font-semibold">Total Excel Rows Parsed:</span>
              <strong className="text-slate-900 font-bold">{importSummary.totalRows}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">New Leads Created:</span>
              <strong className="text-emerald-700 font-bold">+{importSummary.created}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Leads Updated:</span>
              <strong className="text-blue-700 font-bold">{importSummary.updated}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Duplicates Skipped:</span>
              <strong className="text-amber-700 font-bold">{importSummary.skipped}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Invalid Rows:</span>
              <strong className="text-rose-700 font-bold">{importSummary.invalid}</strong>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
              <span>Total Leads in Database:</span>
              <span className="text-brand-600 text-base">{databaseTotal}</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => navigate('/leads')}
              className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              Open CRM Lead Table ({databaseTotal} Leads)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportLeadsPage;
