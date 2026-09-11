import React, { useState } from 'react';
import {
  TrendingUp,
  GitCommit,
  AlertOctagon,
  PieChart as PieIcon,
  Sparkles,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { InsightFinding, InsightCategory } from '../types/dataset';

interface AIAnalysisGridProps {
  findings: InsightFinding[];
  onSelectInsight?: (finding: InsightFinding) => void;
}

export const AIAnalysisGrid: React.FC<AIAnalysisGridProps> = ({
  findings,
  onSelectInsight,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filtered = findings.filter((f) => {
    if (selectedFilter === 'all') return true;
    return f.category === selectedFilter;
  });

  const getCategoryBadge = (category: InsightCategory) => {
    switch (category) {
      case 'trend':
        return {
          icon: <TrendingUp className="w-3.5 h-3.5 text-blue-600" />,
          label: 'Trend & Progression',
          style: 'bg-blue-50 text-blue-700 border-blue-200/80',
        };
      case 'correlation':
        return {
          icon: <GitCommit className="w-3.5 h-3.5 text-purple-600" />,
          label: 'Correlation & Synergy',
          style: 'bg-purple-50 text-purple-700 border-purple-200/80',
        };
      case 'anomaly':
        return {
          icon: <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Outlier & Anomaly',
          style: 'bg-amber-50 text-amber-700 border-amber-200/80',
        };
      case 'distribution':
      default:
        return {
          icon: <PieIcon className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Segment & Share',
          style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        };
    }
  };

  return (
    <div id="ai-analysis-highlights-section" className="space-y-4">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Prioritized AI Discoveries & Patterns
          </h2>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {[
            { id: 'all', label: 'All Findings' },
            { id: 'trend', label: 'Trends' },
            { id: 'correlation', label: 'Correlations' },
            { id: 'anomaly', label: 'Anomalies' },
            { id: 'distribution', label: 'Distributions' },
          ].map((cat) => (
            <button
              key={cat.id}
              id={`filter-insight-${cat.id}`}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of prioritized cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((finding) => {
          const badge = getCategoryBadge(finding.category);
          return (
            <div
              key={finding.id}
              id={`finding-card-${finding.id}`}
              onClick={() => onSelectInsight?.(finding)}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.style}`}
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                    <span>Impact:</span>
                    <span className="font-bold text-slate-800">
                      {finding.significanceScore}/10
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1.5 group-hover:text-indigo-900 transition-colors">
                  {finding.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {finding.summary}
                </p>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Key Indicator:</span>
                  <span className="font-bold text-xs text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100">
                    {finding.keyMetric}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 group-hover:text-indigo-600 flex items-center gap-0.5 font-medium transition-colors">
                  <span>View in Story</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
