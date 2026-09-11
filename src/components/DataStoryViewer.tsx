import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  BookOpen,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import { DataStory, StoryChapter, StoryChartType } from '../types/dataset';

interface DataStoryViewerProps {
  story: DataStory;
  onExploreMetrics?: () => void;
}

const PALETTE = [
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
];

export const DataStoryViewer: React.FC<DataStoryViewerProps> = ({
  story,
  onExploreMetrics,
}) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  const chapters = story.storyChapters;
  const currentChapter = chapters[activeChapterIndex] || chapters[0];

  // Handle keyboard arrow navigation in presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresentationMode) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setActiveChapterIndex((prev) => Math.min(chapters.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveChapterIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setIsPresentationMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, chapters.length]);

  if (!currentChapter) {
    return null;
  }

  const renderChart = (chapter: StoryChapter) => {
    const { chartType, chartConfig } = chapter;
    const data = chartConfig.data || [];
    const xKey = chartConfig.xAxisKey || 'label';
    const yKey = chartConfig.yAxisKey || 'value';
    const secKey = chartConfig.secondaryKey;

    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
          No data points available for this visualization.
        </div>
      );
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 15, right: 25, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke="#cbd5e1"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke="#cbd5e1"
                tickFormatter={(v) => (typeof v === 'number' && v > 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
                name={chartConfig.yLabel || yKey}
              />
              {secKey && (
                <Line
                  type="monotone"
                  dataKey={secKey}
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  name={secKey}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 15, right: 25, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="areaGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="areaGradientSecondary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke="#cbd5e1"
                tickFormatter={(v) => (typeof v === 'number' && v > 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey={yKey}
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#areaGradientPrimary)"
                strokeWidth={2}
                name={chartConfig.yLabel || yKey}
              />
              {secKey && (
                <Area
                  type="monotone"
                  dataKey={secKey}
                  stroke="#06b6d4"
                  fillOpacity={1}
                  fill="url(#areaGradientSecondary)"
                  strokeWidth={2}
                  name={secKey}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={4}
                dataKey={yKey}
                nameKey={xKey}
                label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 15, right: 25, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" name={chartConfig.xLabel || xKey} />
              <YAxis dataKey={yKey} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" name={chartConfig.yLabel || yKey} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Scatter name={chartConfig.title} data={data} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 15, right: 25, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke="#cbd5e1"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke="#cbd5e1"
                tickFormatter={(v) => (typeof v === 'number' && v > 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar
                dataKey={yKey}
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                name={chartConfig.yLabel || yKey}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={PALETTE[index % PALETTE.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div
      id="data-story-viewer-container"
      className={`transition-all ${
        isPresentationMode
          ? 'fixed inset-0 z-50 bg-slate-950 text-white p-6 sm:p-12 flex flex-col justify-between overflow-y-auto'
          : 'bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6'
      }`}
    >
      {/* Top Header & Chapter Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isPresentationMode ? 'text-indigo-400' : 'text-indigo-600'
              }`}
            >
              Chapter {currentChapter.chapterNumber} of {chapters.length}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                isPresentationMode
                  ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
              }`}
            >
              {currentChapter.statBadge}
            </span>
          </div>
          <h2
            className={`text-lg sm:text-xl font-bold tracking-tight ${
              isPresentationMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            {currentChapter.title}
          </h2>
        </div>

        {/* Chapter Stepper Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Presentation Toggle */}
          <button
            id="toggle-presentation-mode-btn"
            onClick={() => setIsPresentationMode(!isPresentationMode)}
            className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              isPresentationMode
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title={isPresentationMode ? 'Exit Presentation Mode (Esc)' : 'Enter Presentation Mode'}
          >
            {isPresentationMode ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Presentation Mode</span>
              </>
            )}
          </button>

          {/* Prev / Next */}
          <button
            id="prev-chapter-btn"
            disabled={activeChapterIndex === 0}
            onClick={() => setActiveChapterIndex((p) => Math.max(0, p - 1))}
            className={`p-2 rounded-lg border disabled:opacity-40 disabled:pointer-events-none transition-colors ${
              isPresentationMode
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            id="next-chapter-btn"
            disabled={activeChapterIndex === chapters.length - 1}
            onClick={() => setActiveChapterIndex((p) => Math.min(chapters.length - 1, p + 1))}
            className={`px-3 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none transition-colors ${
              isPresentationMode
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            <span>Next Chapter</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chapter Indicator Ribbon */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {chapters.map((ch, idx) => (
          <button
            key={ch.id}
            id={`chapter-indicator-${idx}`}
            onClick={() => setActiveChapterIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === activeChapterIndex
                ? 'w-10 bg-indigo-600'
                : isPresentationMode
                ? 'w-3 bg-slate-800 hover:bg-slate-700'
                : 'w-3 bg-slate-200 hover:bg-slate-300'
            }`}
            title={`Chapter ${ch.chapterNumber}: ${ch.title}`}
          />
        ))}
      </div>

      {/* Main Content Area: Narrative Left & Chart Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Narrative & Takeaway (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`p-4 rounded-xl border text-sm leading-relaxed ${
              isPresentationMode
                ? 'bg-slate-900 border-slate-800 text-slate-200'
                : 'bg-slate-50/70 border-slate-200 text-slate-700'
            }`}
          >
            <p className="font-normal">{currentChapter.narrative}</p>
          </div>

          {/* Strategic Takeaway */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isPresentationMode
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
            }`}
          >
            <Lightbulb
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                isPresentationMode ? 'text-emerald-400' : 'text-emerald-600'
              }`}
            />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider block mb-0.5 opacity-90">
                Actionable Strategic Takeaway
              </span>
              <p className="text-xs font-medium leading-relaxed">
                {currentChapter.takeaway}
              </p>
            </div>
          </div>
        </div>

        {/* Chart Visualization (7 cols) */}
        <div className="lg:col-span-7">
          <div
            className={`p-4 rounded-xl border ${
              isPresentationMode
                ? 'bg-slate-900/80 border-slate-800'
                : 'bg-slate-50/40 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h3
                className={`text-xs font-bold uppercase tracking-wider ${
                  isPresentationMode ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {currentChapter.chartConfig.title}
              </h3>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                  isPresentationMode
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                Auto-Selected: {currentChapter.chartType}
              </span>
            </div>

            <div className="h-72 w-full">
              {renderChart(currentChapter)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
