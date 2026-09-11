import React, { useState, useMemo } from 'react';
import {
  Table,
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  Hash,
  Calendar,
  Type,
  ToggleLeft,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { DatasetSummary, DataStory, ColumnMeta } from '../types/dataset';

interface DatasetOverviewProps {
  summary: DatasetSummary;
  story: DataStory | null;
}

export const DatasetOverview: React.FC<DatasetOverviewProps> = ({
  summary,
  story,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumnFilter, setSelectedColumnFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isHealthOpen, setIsHealthOpen] = useState(true);
  const rowsPerPage = 8;

  // Filter and search rows
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return summary.rawData;
    const term = searchTerm.toLowerCase();
    return summary.rawData.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? '').toLowerCase().includes(term)
      )
    );
  }, [summary.rawData, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage]);

  const problemColumns = useMemo(() => {
    return summary.columns.filter((c) => c.isProblematic);
  }, [summary.columns]);

  const getTypeIcon = (type: ColumnMeta['type']) => {
    switch (type) {
      case 'number':
        return <Hash className="w-3 h-3 text-sky-600" />;
      case 'date':
        return <Calendar className="w-3 h-3 text-amber-600" />;
      case 'boolean':
        return <ToggleLeft className="w-3 h-3 text-purple-600" />;
      case 'categorical':
      default:
        return <Type className="w-3 h-3 text-slate-600" />;
    }
  };

  return (
    <div id="dataset-overview-section" className="space-y-6">
      {/* AI Summary Banner */}
      <div
        id="ai-summary-card"
        className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/5 via-sky-900/5 to-transparent border border-indigo-100 relative overflow-hidden"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                AI Dataset Essence & Context
              </h2>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.2 rounded-full">
                {summary.name}
              </span>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed max-w-4xl">
              {story?.datasetDescription ||
                `Captured ${summary.rowCount} records across ${summary.columnCount} attributes. The dataset is configured for statistical storytelling with continuous measures and categorical segmentations.`}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div id="dataset-metrics-strip" className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Total Rows
          </span>
          <div className="text-2xl font-bold text-slate-900">
            {summary.rowCount.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">Records profiled</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Columns / Features
          </span>
          <div className="text-2xl font-bold text-slate-900">
            {summary.columnCount}
          </div>
          <span className="text-[11px] text-slate-400">
            {summary.columns.filter((c) => c.type === 'number').length} numeric,{' '}
            {summary.columns.filter((c) => c.type === 'categorical').length} categories
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Missing Values
          </span>
          <div className="text-2xl font-bold text-slate-900">
            {summary.missingTotal}
          </div>
          <span className="text-[11px] text-slate-400">
            {((summary.missingTotal / (summary.rowCount * summary.columnCount)) * 100).toFixed(1)}% of total cells
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Duplicate Rows
          </span>
          <div className="text-2xl font-bold text-slate-900">
            {summary.duplicatesCount}
          </div>
          <span className="text-[11px] text-slate-400">
            {summary.duplicatesCount === 0 ? '100% Unique' : 'Requires de-duplication'}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Health Score
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {summary.healthScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                summary.healthScore >= 80
                  ? 'bg-emerald-50 text-emerald-700'
                  : summary.healthScore >= 60
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {summary.healthStatus}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block truncate">
            {summary.healthSummary}
          </span>
        </div>
      </div>

      {/* Health & Quality Inspector Accordion */}
      <div
        id="data-health-inspector"
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
      >
        <button
          onClick={() => setIsHealthOpen(!isHealthOpen)}
          className="w-full px-5 py-3.5 bg-slate-50/70 hover:bg-slate-50 border-b border-slate-200 flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center gap-2.5">
            {summary.healthScore >= 80 ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            )}
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Data Health & Hygiene Audit
            </span>
            <span className="text-xs text-slate-500">
              ({problemColumns.length} attention note{problemColumns.length === 1 ? '' : 's'})
            </span>
          </div>
          <span className="text-xs font-semibold text-indigo-600">
            {isHealthOpen ? 'Collapse' : 'Expand Audit Details'}
          </span>
        </button>

        {isHealthOpen && (
          <div className="p-5 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              {summary.healthSummary}
            </p>

            {problemColumns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {problemColumns.map((col) => (
                  <div
                    key={col.name}
                    className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 truncate">
                        {col.name}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                        {col.type}
                      </span>
                    </div>
                    <p className="text-amber-800 text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{col.issueReason}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Zero structural anomalies detected. Clean formatting across all numerical and categorical columns.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Data Preview Table */}
      <div
        id="data-preview-table-container"
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
      >
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/40">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Interactive Data Preview
            </h3>
            <span className="text-xs text-slate-500">
              (Showing {pageRows.length} of {filteredRows.length} records)
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="dataset-search-input"
                type="text"
                placeholder="Search rows or values..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200">
                <th className="py-2.5 px-4 font-semibold text-slate-500 w-12 text-center">
                  #
                </th>
                {summary.columns.map((col) => (
                  <th
                    key={col.name}
                    className="py-2.5 px-4 font-semibold text-slate-700 whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      {getTypeIcon(col.type)}
                      <span>{col.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({col.type})
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.map((row, rowIdx) => {
                const globalIndex = (currentPage - 1) * rowsPerPage + rowIdx + 1;
                return (
                  <tr
                    key={rowIdx}
                    className="hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="py-2 px-4 text-center font-mono text-slate-400 text-[11px]">
                      {globalIndex}
                    </td>
                    {summary.columns.map((col) => {
                      const val = row[col.name];
                      const isNull = val === null || val === undefined || val === '';
                      return (
                        <td
                          key={col.name}
                          className="py-2 px-4 text-slate-700 whitespace-nowrap max-w-xs truncate"
                        >
                          {isNull ? (
                            <span className="text-slate-300 italic text-[11px]">
                              null
                            </span>
                          ) : typeof val === 'number' ? (
                            <span className="font-mono text-slate-900 font-medium">
                              {val.toLocaleString()}
                            </span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={summary.columns.length + 1}
                    className="py-8 text-center text-slate-400"
                  >
                    No records match "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              id="prev-page-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-md border border-slate-200 hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="next-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-md border border-slate-200 hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
