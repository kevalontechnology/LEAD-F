import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { previewExcelApi, confirmExcelImportApi } from '../services/leadService';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

const ImportLeadsPage = () => {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview & Map, 3: Success
  const [previewData, setPreviewData] = useState(null);
  const [duplicateAction, setDuplicateAction] = useState('SKIP');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAndPreview = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select an Excel or CSV file.');

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await previewExcelApi(formData);
      if (res.success) {
        setPreviewData(res.preview);
        setStep(2);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to parse Excel file');
    } finally {
      setLoading(false);
    }
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
        setImportResult(res.result);
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
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Excel / CSV Lead Import</h1>
          <p className="text-xs text-slate-500">
            Upload files, preview duplicate records, and generate personalized messages automatically.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            1. Upload
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            2. Preview & Resolve
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-3 py-1 rounded-full ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            3. Confirm & CRM
          </span>
        </div>
      </div>

      {/* Step 1: Upload File */}
      {step === 1 && (
        <form onSubmit={handleUploadAndPreview} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
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
              Standard Column Header Mapping
            </p>
            <p className="text-[11px] text-slate-600">
              The system automatically recognizes headers: <code className="font-mono bg-white px-1 border rounded">Title / Company Name</code>, <code className="font-mono bg-white px-1 border rounded">CategoryName</code>, <code className="font-mono bg-white px-1 border rounded">Phone</code>, <code className="font-mono bg-white px-1 border rounded">Email</code>, <code className="font-mono bg-white px-1 border rounded">City</code>, <code className="font-mono bg-white px-1 border rounded">Website</code>.
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
                  Preview Import Stats
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Import Preview & Duplicate Resolution */}
      {step === 2 && previewData && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-base font-bold text-slate-900">Import Preview Summary</h2>
            <span className="text-xs text-slate-500">File: {file?.name}</span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-semibold block">Total Records</span>
              <span className="text-2xl font-black text-slate-900">{previewData.totalRecords}</span>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
              <span className="text-xs text-emerald-700 font-semibold block">New Leads</span>
              <span className="text-2xl font-black text-emerald-800">{previewData.newCount}</span>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
              <span className="text-xs text-amber-700 font-semibold block">Duplicates</span>
              <span className="text-2xl font-black text-amber-800">{previewData.duplicateCount}</span>
            </div>

            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-center">
              <span className="text-xs text-rose-700 font-semibold block">Invalid Email</span>
              <span className="text-2xl font-black text-rose-800">{previewData.invalidEmailCount}</span>
            </div>

            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-center">
              <span className="text-xs text-rose-700 font-semibold block">Invalid Phone</span>
              <span className="text-2xl font-black text-rose-800">{previewData.invalidPhoneCount}</span>
            </div>
          </div>

          {/* Duplicate Resolution Selection */}
          {previewData.duplicateCount > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Duplicate Handling Strategy
              </h3>
              <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-amber-200">
                  <input
                    type="radio"
                    name="duplicateAction"
                    value="SKIP"
                    checked={duplicateAction === 'SKIP'}
                    onChange={(e) => setDuplicateAction(e.target.value)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Skip Duplicate Leads (Recommended)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-amber-200">
                  <input
                    type="radio"
                    name="duplicateAction"
                    value="UPDATE"
                    checked={duplicateAction === 'UPDATE'}
                    onChange={(e) => setDuplicateAction(e.target.value)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Update Existing Lead Info</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-amber-200">
                  <input
                    type="radio"
                    name="duplicateAction"
                    value="FORCE"
                    checked={duplicateAction === 'FORCE'}
                    onChange={(e) => setDuplicateAction(e.target.value)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Import Anyway as New Entry</span>
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Choose Different File
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={importing}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {importing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Generating Messages & Importing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Import & Generate Messages
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success Confirmation */}
      {step === 3 && importResult && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Leads Imported Successfully!</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Category-aware personalized outreach messages for WhatsApp & Email have been generated and saved with status <strong className="text-brand-600">MESSAGE_READY</strong>.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">New Leads Imported:</span>
              <strong className="text-emerald-700 font-bold">{importResult.importedCount}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Leads Updated:</span>
              <strong className="text-blue-700 font-bold">{importResult.updatedCount}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Duplicates Skipped:</span>
              <strong className="text-amber-700 font-bold">{importResult.skippedCount}</strong>
            </div>
          </div>

          <div className="bg-brand-50 border border-brand-200 p-4 rounded-xl text-xs text-brand-900 max-w-md mx-auto flex items-start gap-2 text-left">
            <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <span>
              <strong>IMPORTANT:</strong> Messages are currently saved in your CRM. <strong>No WhatsApp or Email messages were automatically sent.</strong> Review and select leads in the CRM table to send.
            </span>
          </div>

          <div className="pt-4">
            <button
              onClick={() => navigate('/leads')}
              className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              Open CRM Lead Table & Review Messages
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportLeadsPage;
