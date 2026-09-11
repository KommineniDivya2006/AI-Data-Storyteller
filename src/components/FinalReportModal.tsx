import React from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  FileCode,
  Table,
  CheckCircle,
  Bookmark,
  Share2,
  Sparkles,
  Award,
} from 'lucide-react';
import { DataStory, DatasetSummary, ChatMessage } from '../types/dataset';
import {
  exportAsMarkdown,
  exportAsJSON,
  exportAsCSV,
  exportAsHTML,
  saveStoryToVault,
} from '../utils/storageVault';

interface FinalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: DataStory;
  summary: DatasetSummary;
  chatHistory?: ChatMessage[];
  onSavedToVault?: () => void;
}

export const FinalReportModal: React.FC<FinalReportModalProps> = ({
  isOpen,
  onClose,
  story,
  summary,
  chatHistory = [],
  onSavedToVault,
}) => {
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  if (!isOpen) return null;

  const handlePrintPDF = () => {
    window.print();
  };

  const handleSaveVault = () => {
    saveStoryToVault(story, summary, chatHistory);
    setSaveSuccess(true);
    onSavedToVault?.();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div
      id="final-report-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="final-report-modal-content"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Executive Data Story Report
              </h2>
              <p className="text-xs text-slate-500">
                {story.datasetTitle} &bull; {summary.rowCount} Rows Profiled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="save-vault-btn"
              onClick={handleSaveVault}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Saved to Vault</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Save to Vault</span>
                </>
              )}
            </button>

            <button
              id="close-report-modal-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Multi-Format Export Action Bar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Multi-Format Accessibility Exports:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {/* Print / PDF */}
            <button
              id="export-pdf-print-btn"
              onClick={handlePrintPDF}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            {/* Markdown */}
            <button
              id="export-markdown-btn"
              onClick={() => exportAsMarkdown(story, summary)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Markdown (.md)</span>
            </button>

            {/* Standalone HTML */}
            <button
              id="export-html-btn"
              onClick={() => exportAsHTML(story, summary)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-600" />
              <span>Interactive HTML</span>
            </button>

            {/* JSON */}
            <button
              id="export-json-btn"
              onClick={() => exportAsJSON(story, summary)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>JSON Data</span>
            </button>

            {/* CSV */}
            <button
              id="export-csv-btn"
              onClick={() => exportAsCSV(summary)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Table className="w-3.5 h-3.5 text-amber-600" />
              <span>CSV Records</span>
            </button>
          </div>
        </div>

        {/* Scrollable Report Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 print:p-0 print:space-y-6">
          {/* Executive Summary Box */}
          <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 relative overflow-hidden">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                  Executive Briefing & Core Takeaway
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {story.executiveSummary.keyHeadline}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Critical Findings */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Key Findings</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {story.executiveSummary.criticalFindings.map((finding, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strategic Next Steps */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Strategic Recommendations</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {story.executiveSummary.strategicRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Chronological Chapters Review */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
              Sequential Storyline (All Chapters)
            </h3>

            <div className="space-y-4">
              {story.storyChapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="p-5 rounded-xl border border-slate-200 bg-white space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 uppercase">
                        Chapter {chapter.chapterNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {chapter.title}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60 self-start sm:self-auto">
                      {chapter.statBadge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {chapter.narrative}
                  </p>

                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-900 flex items-start gap-2">
                    <span className="font-bold shrink-0">Takeaway:</span>
                    <span>{chapter.takeaway}</span>
                  </div>

                  {/* Summary table of chapter points */}
                  <div className="pt-2">
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">
                      Data Points ({chapter.chartConfig.title}):
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {chapter.chartConfig.data.slice(0, 6).map((d, i) => (
                        <div
                          key={i}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md"
                        >
                          <span className="text-slate-500">
                            {d[chapter.chartConfig.xAxisKey] || d.label}:
                          </span>{' '}
                          <span className="font-bold text-slate-800">
                            {d[chapter.chartConfig.yAxisKey] || d.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>AI Data Storyteller Report Export Suite</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
