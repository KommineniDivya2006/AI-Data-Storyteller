import React from 'react';
import {
  Sparkles,
  Upload,
  Archive,
  FileText,
  Database,
  BarChart2,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { DatasetSummary } from '../types/dataset';

interface HeaderProps {
  currentDataset: DatasetSummary | null;
  hasGeminiKey: boolean;
  vaultCount: number;
  activeTab: 'story' | 'explore' | 'overview';
  onTabChange: (tab: 'story' | 'explore' | 'overview') => void;
  onOpenUpload: () => void;
  onOpenVault: () => void;
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDataset,
  hasGeminiKey,
  vaultCount,
  activeTab,
  onTabChange,
  onOpenUpload,
  onOpenVault,
  onOpenReport,
}) => {
  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Active Dataset */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-lg">
                AI Data Storyteller
              </span>
              <span
                id="ai-engine-badge"
                className={`hidden md:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                  hasGeminiKey
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Cpu className="w-3 h-3" />
                {hasGeminiKey ? 'Gemini 3.8 Flash' : 'Hybrid Analytics'}
              </span>
            </div>
            {currentDataset && (
              <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                <Database className="w-3 h-3 shrink-0 text-slate-400" />
                <span className="font-medium text-slate-700 truncate">
                  {currentDataset.name}
                </span>
                <span>&bull;</span>
                <span>{currentDataset.rowCount.toLocaleString()} rows</span>
                <span>&bull;</span>
                <span>{currentDataset.columnCount} columns</span>
              </div>
            )}
          </div>
        </div>

        {/* Center Navigation Tabs (when dataset loaded) */}
        {currentDataset && (
          <nav
            id="header-nav-tabs"
            className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80"
          >
            <button
              id="tab-btn-story"
              onClick={() => onTabChange('story')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'story'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Data Story & Insights
            </button>
            <button
              id="tab-btn-explore"
              onClick={() => onTabChange('explore')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'explore'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-sky-500" />
              Explore & Ask AI
            </button>
            <button
              id="tab-btn-overview"
              onClick={() => onTabChange('overview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Dataset Quality & Table
            </button>
          </nav>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* History Vault Button */}
          <button
            id="btn-open-vault"
            onClick={onOpenVault}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="View saved stories vault"
          >
            <Archive className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Saved Vault</span>
            {vaultCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px] font-bold">
                {vaultCount}
              </span>
            )}
          </button>

          {/* Export Report (if story exists) */}
          {currentDataset && (
            <button
              id="btn-open-report"
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          )}

          {/* Upload Button */}
          <button
            id="btn-upload-dataset"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New</span>
          </button>
        </div>
      </div>
    </header>
  );
};
