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
  Sliders,
  X,
  FilePlus,
  Files
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

const getSmartMapping = (header) => {
  if (!header) return 'ignore';
  const clean = String(header).toLowerCase().trim();

  const directMaps = {
    title: 'title',
    'company name': 'title',
    company: 'title',
    titlename: 'title',
    name: 'title',
    'business name': 'title',
    'company / title': 'title',
    'column 1': 'title',
    categoryname: 'categoryName',
    category: 'categoryName',
    industry: 'categoryName',
    business: 'categoryName',
    'column 2': 'categoryName',
    phone: 'phone',
    mobile: 'phone',
    contact: 'phone',
    'phone number': 'phone',
    'mobile number': 'phone',
    'phone / address': 'phone',
    'column 3': 'phone',
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

  if (directMaps[clean]) return directMaps[clean];

  if (clean.includes('company') || clean.includes('title') || clean.includes('business') || clean.includes('firm') || clean.includes('col 1') || clean.includes('column 1')) {
    return 'title';
  }
  if (clean.includes('category') || clean.includes('industry') || clean.includes('type') || clean.includes('col 2') || clean.includes('column 2')) {
    return 'categoryName';
  }
  if (clean.includes('phone') || clean.includes('mobile') || clean.includes('contact') || clean.includes('cell') || clean.includes('num') || clean.includes('col 3') || clean.includes('column 3')) {
    return 'phone';
  }
  if (clean.includes('email') || clean.includes('mail')) {
    return 'email';
  }
  if (clean.includes('city') || clean.includes('location')) {
    return 'city';
  }
  if (clean.includes('state')) {
    return 'state';
  }
  if (clean.includes('website') || clean.includes('site') || clean.includes('url') || clean.includes('domain')) {
    return 'website';
  }
  if (clean.includes('address') || clean.includes('street')) {
    return 'address';
  }
  if (clean.includes('person') || clean.includes('owner') || clean.includes('manager')) {
    return 'contactPerson';
  }

  return 'ignore';
};

const ImportLeadsPage = () => {
  const [files, setFiles] = useState([]);
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
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prevFiles) => {
        const existingKeys = new Set(prevFiles.map((f) => `${f.name}-${f.size}`));
        const uniqueNew = selectedFiles.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
        return [...prevFiles, ...uniqueNew];
      });
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUploadAndPreview = async (e, customMap = null) => {
    if (e) e.preventDefault();
    if (files.length === 0) return alert('Please select at least one Excel or CSV file.');

    try {
      setLoading(true);
      const formData = new FormData();
      files.forEach((f) => {
        formData.append('files', f);
      });
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
            initialMap[h] = getSmartMapping(h);
          });
          setColumnMapping(initialMap);
        }

        setStep(2);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to parse uploaded Excel file(s)');
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

        // Invalidate query caches
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Excel / CSV Multi-File Lead Import</h1>
          <p className="text-xs text-slate-500">
            Upload single or multiple Excel/CSV files at once, map columns dynamically, and import into CRM.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            1. Select Files
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

      {/* Step 1: Upload Files */}
      {step === 1 && (
        <form onSubmit={(e) => handleUploadAndPreview(e)} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-8 text-center transition-colors bg-slate-50/50">
            <UploadCloud className="w-12 h-12 text-brand-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">Upload Single or Multiple Excel / CSV Files</p>
            <p className="text-xs text-slate-500 mt-1">Select one or multiple .xlsx, .xls, and .csv files</p>

            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all"
            >
              <FilePlus className="w-4 h-4" />
              {files.length > 0 ? 'Select Additional Files' : 'Choose Excel / CSV Files'}
            </label>

            {/* List of selected files */}
            {files.length > 0 && (
              <div className="mt-5 space-y-2 text-left max-w-xl mx-auto">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 px-1">
                  <span className="flex items-center gap-1.5">
                    <Files className="w-4 h-4 text-brand-600" />
                    Selected Files ({files.length}):
                  </span>
                  <span className="text-slate-500 font-normal">
                    Total: {(files.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {files.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-emerald-50 text-emerald-900 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-semibold">
                      <div className="flex items-center gap-2 truncate">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="truncate" title={f.name}>{f.name}</span>
                        <span className="text-[10px] text-emerald-600 flex-shrink-0">({(f.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="p-1 hover:bg-emerald-200 rounded-lg text-emerald-800 transition-colors ml-2"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl text-xs text-brand-900 space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              Dynamic Multi-File & Column Auto-Mapping
            </p>
            <p className="text-[11px] text-slate-600">
              You can upload multiple Excel files at once. All data will be merged, deduplicated, auto-mapped, and processed in a single batch.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={files.length === 0 || loading}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing {files.length} File(s)...
                </>
              ) : (
                <>
                  Parse Columns & Preview ({files.length} Files)
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-600" />
                Confirm Column Mapping for {files.length} Uploaded File(s)
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Detected Columns Across Files: {detectedHeaders.length}
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
                Combined Import Summary Preview ({files.length} Files)
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
                Change Selected Files
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
            <h2 className="text-xl font-bold text-slate-900">Multi-File Import Completed Successfully!</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All records mapped from your {files.length} uploaded file(s) have been processed. Messages are generated and saved in status <strong className="text-brand-600">MESSAGE_READY</strong>.
            </p>
          </div>

          {/* Import Summary Breakdown */}
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
