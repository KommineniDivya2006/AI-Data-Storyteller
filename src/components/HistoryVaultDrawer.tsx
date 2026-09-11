import React from 'react';
import {
  X,
  Archive,
  Clock,
  Trash2,
  FolderOpen,
  CheckCircle,
  Database,
  ArrowRight,
} from 'lucide-react';
import { SavedStoryItem } from '../types/dataset';
import { removeSavedStory } from '../utils/storageVault';

interface HistoryVaultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedStories: SavedStoryItem[];
  onSelectStory: (item: SavedStoryItem) => void;
  onStoriesUpdated: () => void;
}

export const HistoryVaultDrawer: React.FC<HistoryVaultDrawerProps> = ({
  isOpen,
  onClose,
  savedStories,
  onSelectStory,
  onStoriesUpdated,
}) => {
  if (!isOpen) return null;

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeSavedStory(id);
    onStoriesUpdated();
  };

  return (
    <div
      id="history-vault-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="history-vault-panel"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-slate-200"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Archive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Saved Stories Vault
              </h3>
              <p className="text-xs text-slate-500">
                {savedStories.length} persistent saved session{savedStories.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <button
            id="close-vault-drawer-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedStories.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Vault is Currently Empty
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Save any data story via the "Export Report &gt; Save to Vault" button to access your reports anytime.
              </p>
            </div>
          ) : (
            savedStories.map((item) => (
              <div
                key={item.id}
                id={`vault-item-${item.id}`}
                onClick={() => {
                  onSelectStory(item);
                  onClose();
                }}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-all group relative"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-950 truncate">
                    {item.story.datasetTitle}
                  </h4>
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors"
                    title="Delete saved story"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                  {item.story.executiveSummary.keyHeadline}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.savedAt).toLocaleDateString()}</span>
                    <span>&bull;</span>
                    <span>{item.rowCount} rows</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>Load Story</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Local client-side persistence</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
