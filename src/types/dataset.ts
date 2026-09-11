export type ColumnDataType = 'number' | 'date' | 'categorical' | 'boolean' | 'text';

export interface ColumnMeta {
  name: string;
  type: ColumnDataType;
  sampleValues: any[];
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  isProblematic: boolean;
  issueReason?: string;
  stats?: {
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    stdDev?: number;
    outliersCount?: number;
    topValues?: { value: string; count: number; percent: number }[];
    dateSpan?: { min: string; max: string; spanDays: number };
  };
}

export interface DatasetSummary {
  id: string;
  name: string;
  uploadedAt: string;
  rowCount: number;
  columnCount: number;
  columns: ColumnMeta[];
  rawData: Record<string, any>[];
  duplicatesCount: number;
  missingTotal: number;
  healthScore: number;
  healthStatus: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  healthSummary: string;
  healthCaveats: string[];
}

export type InsightCategory = 'trend' | 'correlation' | 'anomaly' | 'distribution';

export interface InsightFinding {
  id: string;
  category: InsightCategory;
  title: string;
  summary: string;
  keyMetric: string;
  significanceScore: number; // 1 to 10
}

export type StoryChartType = 'bar' | 'line' | 'area' | 'pie' | 'scatter';

export interface StoryChartConfig {
  title: string;
  xAxisKey: string;
  yAxisKey: string;
  secondaryKey?: string;
  xLabel?: string;
  yLabel?: string;
  data: Record<string, any>[];
}

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  narrative: string;
  statBadge: string;
  chartType: StoryChartType;
  chartConfig: StoryChartConfig;
  takeaway: string;
}

export interface ExecutiveSummary {
  keyHeadline: string;
  criticalFindings: string[];
  strategicRecommendations: string[];
}

export interface DataStory {
  id: string;
  datasetId: string;
  datasetTitle: string;
  datasetDescription: string;
  generatedAt: string;
  dataHealth: {
    score: number;
    status: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
    summary: string;
    caveats: string[];
  };
  prioritizedFindings: InsightFinding[];
  storyChapters: StoryChapter[];
  executiveSummary: ExecutiveSummary;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isGenerating?: boolean;
  visualization?: {
    chartType: StoryChartType;
    title: string;
    xAxisKey: string;
    yAxisKey: string;
    xLabel?: string;
    yLabel?: string;
    data: Record<string, any>[];
    explanation?: string;
  };
  suggestedFollowUps?: string[];
}

export interface SavedStoryItem {
  id: string;
  savedAt: string;
  datasetName: string;
  rowCount: number;
  columnCount: number;
  story: DataStory;
  summary: DatasetSummary;
  chatHistory: ChatMessage[];
}
