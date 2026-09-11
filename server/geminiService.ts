import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface DatasetAnalysisInput {
  name: string;
  rowCount: number;
  columnCount: number;
  columns: {
    name: string;
    type: string;
    sampleValues: any[];
    missingCount: number;
    stats?: Record<string, any>;
  }[];
  sampleRows: Record<string, any>[];
  dataIssues: {
    missingValuesTotal: number;
    duplicateRows: number;
    problematicColumns: string[];
  };
}

export interface ChatQueryInput {
  question: string;
  datasetName: string;
  schemaSummary: string;
  sampleData: Record<string, any>[];
  insightsSummary: string;
  activeFilters?: Record<string, any>;
}

export async function generateDatasetStory(input: DatasetAnalysisInput) {
  const ai = getGenAI();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }

  const prompt = `You are an expert Data Storyteller and Senior Analytics Translator.
Your job is to transform raw structured dataset summaries into an engaging, intuitive, and visually compelling data story designed for a non-technical audience (executives, product leaders, domain specialists).

DATASET OVERVIEW:
- Name: "${input.name}"
- Rows: ${input.rowCount}, Columns: ${input.columnCount}
- Missing values: ${input.dataIssues.missingValuesTotal}, Duplicate rows: ${input.dataIssues.duplicateRows}
- Columns & Summary Statistics:
${JSON.stringify(input.columns, null, 2)}

SAMPLE DATA (first rows):
${JSON.stringify(input.sampleRows.slice(0, 8), null, 2)}

TASK:
1. Provide a short, beginner-friendly dataset description (what it tracks, why it matters).
2. Assess data health & quality (missingness, caveats).
3. Identify top 4-6 prioritized findings across:
   - "trend" (changes over time/sequence)
   - "correlation" (strong associations between numbers)
   - "anomaly" (spikes, unexpected drops, outliers)
   - "distribution" (rankings, concentrations, 80/20 breakdown)
4. Create a logical narrative DATA STORY sequence with 4 to 6 "chapters".
   Each chapter must build upon the previous one, like a compelling story:
   - Chapter 1: The Landscape / Overview (establishing baseline numbers)
   - Chapter 2: The Core Driver or Star Performer
   - Chapter 3: The Critical Friction, Anomaly, or Drop
   - Chapter 4: Hidden Correlation or Nuance
   - Chapter 5: Strategic Outlook / Turning Point
   For EVERY chapter, provide:
   - title: Human-readable, captivating, concrete (e.g. "European Enterprise Accounts Surged 41%")
   - narrative: 2-3 clear sentences explaining the insight without statistical jargon
   - statBadge: A concise numerical callout (e.g. "+38.4% YoY", "Top 3 Drive 74%", "$1.2M Gap")
   - chartType: ONE of ["bar", "line", "area", "pie", "scatter"]
   - chartConfig:
     * title: clear chart title
     * xAxisKey: field name for X axis
     * yAxisKey: field name for Y axis
     * secondaryKey: optional second series or metric
     * xLabel: label for X axis
     * yLabel: label for Y axis
     * data: an array of 5 to 12 realistic aggregated points reflecting the exact insight, derived accurately from the dataset summary or sample distributions
   - takeaway: A single high-impact bullet on what action or decision this implies.
5. Create an Executive Summary with:
   - keyHeadline: 1 punchy sentence summarizing the main story
   - criticalFindings: 3-4 bullet points
   - strategicRecommendations: 2-3 actionable next steps

Respond ONLY with a valid JSON object matching this schema:
{
  "datasetTitle": string,
  "datasetDescription": string,
  "dataHealth": {
    "score": number (0 to 100),
    "status": "Excellent" | "Good" | "Fair" | "Needs Attention",
    "summary": string,
    "caveats": string[]
  },
  "prioritizedFindings": [
    {
      "category": "trend" | "correlation" | "anomaly" | "distribution",
      "title": string,
      "summary": string,
      "keyMetric": string,
      "significanceScore": number (1 to 10)
    }
  ],
  "storyChapters": [
    {
      "id": string,
      "chapterNumber": number,
      "title": string,
      "narrative": string,
      "statBadge": string,
      "chartType": "bar" | "line" | "area" | "pie" | "scatter",
      "chartConfig": {
        "title": string,
        "xAxisKey": string,
        "yAxisKey": string,
        "secondaryKey": string,
        "xLabel": string,
        "yLabel": string,
        "data": [{"label": string, "value": number, ...}]
      },
      "takeaway": string
    }
  ],
  "executiveSummary": {
    "keyHeadline": string,
    "criticalFindings": string[],
    "strategicRecommendations": string[]
  }
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const rawText = response.text || '{}';
  try {
    return JSON.parse(rawText);
  } catch (e) {
    // Clean potential markdown wrap
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
}

export async function askDataAssistant(input: ChatQueryInput) {
  const ai = getGenAI();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }

  const prompt = `You are the Data Storyteller AI Assistant. A user is asking a question about the uploaded dataset.

DATASET CONTEXT:
- Dataset Name: "${input.datasetName}"
- Schema & Summary:
${input.schemaSummary}

DATASET HIGHLIGHTS & STORY CONTEXT:
${input.insightsSummary}

SAMPLE DATA ROWS:
${JSON.stringify(input.sampleData.slice(0, 10), null, 2)}

${input.activeFilters ? `ACTIVE USER FILTERS:\n${JSON.stringify(input.activeFilters, null, 2)}` : ''}

USER QUESTION: "${input.question}"

YOUR GOAL:
1. Provide a direct, plain-language answer that explains the "why" and "what", not just raw numbers.
2. If the user asks for trends, comparisons, breakdowns, anomalies, or distributions (e.g. "biggest trend", "why did sales decrease", "which category performs best", "show me anomalies"), synthesize a relevant supporting visualization!
3. Provide 2-3 logical follow-up questions the user might want to ask next.

Return ONLY a JSON object with this exact structure:
{
  "answer": "Clear, friendly, data-grounded answer in markdown format (can use bolding, bullet points)",
  "hasVisualization": boolean,
  "visualization": {
    "chartType": "bar" | "line" | "area" | "pie" | "scatter",
    "title": "Descriptive Chart Title",
    "xAxisKey": "label",
    "yAxisKey": "value",
    "xLabel": "X Axis Label",
    "yLabel": "Y Axis Label",
    "data": [
      { "label": string, "value": number, ... }
    ],
    "explanation": "1 sentence explaining what this chart reveals"
  } (or null if hasVisualization is false),
  "suggestedFollowUps": ["Question 1?", "Question 2?", "Question 3?"]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const rawText = response.text || '{}';
  try {
    return JSON.parse(rawText);
  } catch (e) {
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
}
