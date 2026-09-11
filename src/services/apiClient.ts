import { DatasetSummary, DataStory, ChatMessage } from '../types/dataset';

export interface HealthCheckResponse {
  status: string;
  hasGeminiKey: boolean;
  timestamp: string;
}

export async function checkServerHealth(): Promise<HealthCheckResponse> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      throw new Error(`Health check returned ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      hasGeminiKey: false,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function requestGeminiStoryAnalysis(
  summary: DatasetSummary
): Promise<DataStory> {
  const payload = {
    name: summary.name,
    rowCount: summary.rowCount,
    columnCount: summary.columnCount,
    columns: summary.columns.map((c) => ({
      name: c.name,
      type: c.type,
      sampleValues: c.sampleValues,
      missingCount: c.nullCount,
      stats: c.stats,
    })),
    sampleRows: summary.rawData.slice(0, 15),
    dataIssues: {
      missingValuesTotal: summary.missingTotal,
      duplicateRows: summary.duplicatesCount,
      problematicColumns: summary.columns
        .filter((c) => c.isProblematic)
        .map((c) => `${c.name} (${c.issueReason})`),
    },
  };

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Server returned ${response.status}`);
  }

  const data = await response.json();

  // Validate and normalize structure
  return {
    id: 'story_' + Date.now(),
    datasetId: summary.id,
    datasetTitle: data.datasetTitle || summary.name.replace(/_/g, ' '),
    datasetDescription:
      data.datasetDescription ||
      `Comprehensive analysis of ${summary.rowCount} rows and ${summary.columnCount} columns.`,
    generatedAt: new Date().toISOString(),
    dataHealth: data.dataHealth || {
      score: summary.healthScore,
      status: summary.healthStatus,
      summary: summary.healthSummary,
      caveats: summary.healthCaveats,
    },
    prioritizedFindings: data.prioritizedFindings || [],
    storyChapters: data.storyChapters || [],
    executiveSummary: data.executiveSummary || {
      keyHeadline: `${summary.name} Storyline`,
      criticalFindings: [],
      strategicRecommendations: [],
    },
  };
}

export async function requestGeminiChatAnswer(params: {
  question: string;
  datasetName: string;
  summary: DatasetSummary;
  story: DataStory;
  activeFilters?: Record<string, any>;
}): Promise<{
  answer: string;
  hasVisualization: boolean;
  visualization?: any;
  suggestedFollowUps?: string[];
}> {
  const schemaSummary = summaryToText(params.summary);
  const insightsSummary = storyToText(params.story);

  const payload = {
    question: params.question,
    datasetName: params.datasetName,
    schemaSummary,
    insightsSummary,
    sampleData: params.summary.rawData.slice(0, 15),
    activeFilters: params.activeFilters,
  };

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Chat error: ${res.status}`);
  }

  return await res.json();
}

function summaryToText(summary: DatasetSummary): string {
  const cols = summary.columns
    .map(
      (c) =>
        `- ${c.name} (${c.type}): nulls=${c.nullCount}, unique=${c.uniqueCount}${
          c.stats?.mean ? `, mean=${c.stats.mean}` : ''
        }`
    )
    .join('\n');
  return `Rows: ${summary.rowCount}, Columns: ${summary.columnCount}\n${cols}`;
}

function storyToText(story: DataStory): string {
  const findings = story.prioritizedFindings
    .map((f) => `* [${f.category}] ${f.title}: ${f.summary}`)
    .join('\n');
  return `Key Discoveries:\n${findings}\nExecutive Takeaway: ${story.executiveSummary.keyHeadline}`;
}
