import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { SAMPLE_DATASETS, SampleDatasetDefinition } from '../data/sampleDatasets';
import { parseDatasetFile } from '../utils/dataProfiler';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetLoaded: (name: string, rawData: Record<string, any>[]) => void;
  isLoading?: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDatasetLoaded,
  isLoading = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsingProgress, setParsingProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
      setErrorMessage('Please upload a valid .csv, .xlsx, or .xls file.');
      return;
    }

    try {
      setErrorMessage(null);
      setParsingProgress(`Reading and parsing "${file.name}"...`);
      const { name, rawData } = await parseDatasetFile(file);

      if (rawData.length === 0) {
        throw new Error('Dataset contains no data rows.');
      }

      setParsingProgress(`Profiling ${rawData.length} rows and generating AI Story...`);
      onDatasetLoaded(name, rawData);
      onClose();
    } catch (err: any) {
      console.error('File parsing failed:', err);
      setErrorMessage(err.message || 'Failed to read spreadsheet file');
    } finally {
      setParsingProgress(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleSampleClick = (sample: SampleDatasetDefinition) => {
    setParsingProgress(`Loading "${sample.name}" sample dataset...`);
    onDatasetLoaded(sample.name, sample.data);
    onClose();
    setParsingProgress(null);
  };

  return (
    <div
      id="upload-dataset-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        id="upload-dataset-modal-content"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Upload or Select Dataset
              </h2>
              <p className="text-xs text-slate-500">
                Supports CSV, Excel (.xlsx, .xls) files up to 50MB
              </p>
            </div>
          </div>
          <button
            id="close-upload-modal-btn"
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Parsing Progress Banner */}
          {parsingProgress && (
            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-xs flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-sky-600 animate-spin" />
              <div className="font-medium">{parsingProgress}</div>
            </div>
          )}

          {/* Drag and Drop Zone */}
          <div
            id="file-dropzone-container"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-3 text-indigo-600">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">
              Drag and drop your spreadsheet here, or <span className="text-indigo-600 underline">browse</span>
            </p>
            <p className="text-xs text-slate-500">
              CSV or Excel spreadsheet (.csv, .xlsx, .xls)
            </p>
          </div>

          {/* Sample Datasets Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Or pick a curated sample dataset to test instantly
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_DATASETS.map((sample) => (
                <button
                  key={sample.id}
                  id={`sample-ds-btn-${sample.id}`}
                  onClick={() => handleSampleClick(sample)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md mb-2">
                      {sample.tag}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-950 mb-1">
                      {sample.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-indigo-600 font-medium">
                    <span>{sample.rowCount} records</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Client-side parsing & secure server analytics</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
