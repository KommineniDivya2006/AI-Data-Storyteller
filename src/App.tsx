import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Archive,
  FileText,
  RefreshCw,
  AlertCircle,
  Database,
} from 'lucide-react';
import {
  DatasetSummary,
  DataStory,
  ChatMessage,
  SavedStoryItem,
} from './types/dataset';
import {
  profileDataset,
  buildFallbackDataStory,
} from './utils/dataProfiler';
import {
  getSavedStories,
  saveStoryToVault,
} from './utils/storageVault';
import {
  checkServerHealth,
  requestGeminiStoryAnalysis,
} from './services/apiClient';
import { SAMPLE_DATASETS, SampleDatasetDefinition } from './data/sampleDatasets';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { DatasetOverview } from './components/DatasetOverview';
import { AIAnalysisGrid } from './components/AIAnalysisGrid';
import { DataStoryViewer } from './components/DataStoryViewer';
import { InteractiveExplorer } from './components/InteractiveExplorer';
import { FinalReportModal } from './components/FinalReportModal';
import { HistoryVaultDrawer } from './components/HistoryVaultDrawer';
import { UploadModal } from './components/UploadModal';

export default function App() {
  const [currentDataset, setCurrentDataset] = useState<DatasetSummary | null>(null);
  const [story, setStory] = useState<DataStory | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'story' | 'explore' | 'overview'>('story');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Analyzing dataset...');
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [savedStories, setSavedStories] = useState<SavedStoryItem[]>([]);

  // Check health on mount and retrieve vault
  useEffect(() => {
    checkServerHealth().then((res) => {
      setHasGeminiKey(res.hasGeminiKey);
    });
    setSavedStories(getSavedStories());
  }, []);

  // Handle dataset loading (from upload or sample)
  const handleDatasetLoaded = async (name: string, rawData: Record<string, any>[]) => {
    try {
      setIsLoading(true);
      setLoadingText(`Profiling ${rawData.length} records and checking data quality...`);

      // 1. Client-side profile
      const summary = profileDataset(name, rawData);
      setCurrentDataset(summary);

      // 2. Generate immediate baseline story
      const baselineStory = buildFallbackDataStory(summary);
      setStory(baselineStory);
      setChatMessages([]);
      setActiveTab('story');

      // 3. Request Gemini AI analysis
      setLoadingText('Gemini 3.8 Flash is crafting narrative chapters & discoveries...');
      try {
        const aiStory = await requestGeminiStoryAnalysis(summary);
        setStory(aiStory);
        // Persist to vault
        saveStoryToVault(aiStory, summary, []);
        setSavedStories(getSavedStories());
      } catch (aiErr) {
        console.warn('Gemini story generation fallback to local analytics:', aiErr);
        // Baseline story remains active
        saveStoryToVault(baselineStory, summary, []);
        setSavedStories(getSavedStories());
      }
    } catch (err: any) {
      console.error('Failed to load dataset:', err);
      alert(`Error loading dataset: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  const handleSelectSample = (sample: SampleDatasetDefinition) => {
    handleDatasetLoaded(sample.name, sample.data);
  };

  const handleSelectSavedStory = (item: SavedStoryItem) => {
    setCurrentDataset(item.summary);
    setStory(item.story);
    setChatMessages(item.chatHistory || []);
    setActiveTab('story');
  };

  return (
    <div id="ai-data-storyteller-app" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Global Header */}
      <Header
        currentDataset={currentDataset}
        hasGeminiKey={hasGeminiKey}
        vaultCount={savedStories.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading Overlay when generating story */}
        {isLoading && (
          <div
            id="story-generating-overlay"
            className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-between gap-4 animate-in fade-in"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-900 block">
                  AI Storyteller in Progress
                </span>
                <p className="text-xs text-indigo-700 font-medium">
                  {loadingText}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 bg-white px-2.5 py-1 rounded-full border border-indigo-200">
              Instant Preview Available
            </span>
          </div>
        )}

        {!currentDataset ? (
          /* Landing Screen when no dataset is active */
          <LandingHero
            onOpenUpload={() => setIsUploadOpen(true)}
            onSelectSample={handleSelectSample}
          />
        ) : (
          /* Active Dataset Workspace */
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Tab 1: Story & Insights */}
            {activeTab === 'story' && story && (
              <div className="space-y-6">
                {/* Visual Data Story Chapters */}
                <DataStoryViewer story={story} />

                {/* Prioritized AI Discoveries & Patterns */}
                <AIAnalysisGrid findings={story.prioritizedFindings} />
              </div>
            )}

            {/* Tab 2: Interactive Exploration & Q&A Assistant */}
            {activeTab === 'explore' && story && (
              <InteractiveExplorer
                summary={currentDataset}
                story={story}
                chatMessages={chatMessages}
                onUpdateChatMessages={setChatMessages}
              />
            )}

            {/* Tab 3: Dataset Quality & Raw Table */}
            {activeTab === 'overview' && (
              <DatasetOverview summary={currentDataset} story={story} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI Data Storyteller &bull; Visual Analytics & Automated Reporting</span>
          <span className="text-[11px] text-slate-400">
            Supports CSV, Excel (.xlsx, .xls) &bull; Multi-Format Exports
          </span>
        </div>
      </footer>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDatasetLoaded={handleDatasetLoaded}
        isLoading={isLoading}
      />

      {/* Executive Report & Export Modal */}
      {story && currentDataset && (
        <FinalReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          story={story}
          summary={currentDataset}
          chatHistory={chatMessages}
          onSavedToVault={() => setSavedStories(getSavedStories())}
        />
      )}

      {/* History Vault Drawer */}
      <HistoryVaultDrawer
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        savedStories={savedStories}
        onSelectStory={handleSelectSavedStory}
        onStoriesUpdated={() => setSavedStories(getSavedStories())}
      />
    </div>
  );
}
