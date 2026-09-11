import React from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Sparkles,
  TrendingUp,
  BarChart3,
  MessageSquare,
  FileText,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SAMPLE_DATASETS, SampleDatasetDefinition } from '../data/sampleDatasets';

interface LandingHeroProps {
  onOpenUpload: () => void;
  onSelectSample: (sample: SampleDatasetDefinition) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onOpenUpload,
  onSelectSample,
}) => {
  return (
    <div id="landing-hero-container" className="max-w-5xl mx-auto py-12 px-4 space-y-12">
      {/* Hero Headline & Upload Trigger */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transform Numbers into Narrative</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Turn your spreadsheets into <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent">
            an understandable visual story
          </span>
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Upload any CSV or Excel file. AI automatically profiles data quality, identifies key trends and anomalies, and builds a compelling chapter-by-chapter visual narrative.
        </p>

        {/* Primary Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="hero-upload-dataset-btn"
            onClick={onOpenUpload}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <UploadCloud className="w-5 h-5 text-indigo-400" />
            <span>Upload CSV or Excel Dataset</span>
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Supports .csv, .xlsx, and .xls files &bull; Instant client-side parsing
        </p>
      </div>

      {/* 4-Step Narrative Flow Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4">
        {[
          {
            step: '01',
            icon: <FileSpreadsheet className="w-5 h-5 text-sky-600" />,
            title: 'Upload Dataset',
            desc: 'Drag and drop your spreadsheet with instant row/column profiling.',
          },
          {
            step: '02',
            icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
            title: 'Health & Quality',
            desc: 'Detects missing values, duplicates, and statistical outliers.',
          },
          {
            step: '03',
            icon: <Sparkles className="w-5 h-5 text-indigo-600" />,
            title: 'AI Story Generation',
            desc: 'Turns findings into narrative chapters with automated chart choices.',
          },
          {
            step: '04',
            icon: <MessageSquare className="w-5 h-5 text-amber-600" />,
            title: 'Ask & Export',
            desc: 'Chat with your data, filter metrics, and export executive reports.',
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                {item.icon}
              </div>
              <span className="font-mono text-xs font-bold text-slate-300">
                {item.step}
              </span>
            </div>
            <h2 className="text-xs font-bold text-slate-900">{item.title}</h2>
            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Quick Try Sample Datasets */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Or Try One of Our Curated Datasets
            </h2>
            <p className="text-xs text-slate-500">
              Click any sample below to experience the visual storytelling flow immediately
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_DATASETS.map((sample) => (
            <div
              key={sample.id}
              id={`landing-sample-card-${sample.id}`}
              onClick={() => onSelectSample(sample)}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <span className="inline-block text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {sample.tag}
                </span>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                  {sample.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium group-hover:text-indigo-600 transition-colors">
                <span>{sample.rowCount} records</span>
                <div className="flex items-center gap-1 font-semibold">
                  <span>Explore Story</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
