import { SavedStoryItem, DataStory, DatasetSummary, ChatMessage } from '../types/dataset';

const VAULT_STORAGE_KEY = 'ai_data_storyteller_vault_v1';

export function getSavedStories(): SavedStoryItem[] {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read saved stories from vault:', err);
    return [];
  }
}

export function saveStoryToVault(
  story: DataStory,
  summary: DatasetSummary,
  chatHistory: ChatMessage[] = []
): SavedStoryItem {
  const existing = getSavedStories();
  const newItem: SavedStoryItem = {
    id: 'vault_' + Date.now(),
    savedAt: new Date().toISOString(),
    datasetName: summary.name,
    rowCount: summary.rowCount,
    columnCount: summary.columnCount,
    story,
    summary,
    chatHistory,
  };

  // Filter out any existing item with same dataset id to avoid duplicates
  const updated = [newItem, ...existing.filter((item) => item.summary.id !== summary.id)].slice(0, 20);

  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage full, trimming rawData to fit vault');
    // If full, trim heavy rawData and save
    const trimmedItem = {
      ...newItem,
      summary: { ...summary, rawData: summary.rawData.slice(0, 50) },
    };
    const trimmedList = [trimmedItem, ...existing.slice(0, 5)];
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(trimmedList));
  }

  return newItem;
}

export function removeSavedStory(id: string): void {
  const existing = getSavedStories();
  const updated = existing.filter((item) => item.id !== id);
  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
}

// Download helpers for multi-format exports
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsMarkdown(story: DataStory, summary: DatasetSummary): void {
  let md = `# Visual Data Story: ${story.datasetTitle}\n\n`;
  md += `*Generated on ${new Date(story.generatedAt).toLocaleDateString()} | ${summary.rowCount} Rows | ${summary.columnCount} Columns*\n\n`;
  md += `## Executive Summary\n\n`;
  md += `> **${story.executiveSummary.keyHeadline}**\n\n`;

  md += `### Critical Findings\n`;
  story.executiveSummary.criticalFindings.forEach((f) => {
    md += `- ${f}\n`;
  });
  md += `\n`;

  md += `### Strategic Next Steps\n`;
  story.executiveSummary.strategicRecommendations.forEach((r) => {
    md += `- ${r}\n`;
  });
  md += `\n---\n\n`;

  md += `## Data Health & Quality Inspector\n\n`;
  md += `- **Health Score:** ${story.dataHealth.score}/100 (${story.dataHealth.status})\n`;
  md += `- **Summary:** ${story.dataHealth.summary}\n`;
  if (story.dataHealth.caveats.length > 0) {
    md += `\n**Hygiene Caveats:**\n`;
    story.dataHealth.caveats.forEach((c) => {
      md += `- ${c}\n`;
    });
  }
  md += `\n---\n\n`;

  md += `## Prioritized Insights & Discoveries\n\n`;
  story.prioritizedFindings.forEach((f, idx) => {
    md += `### ${idx + 1}. [${f.category.toUpperCase()}] ${f.title}\n`;
    md += `**Key Metric:** \`${f.keyMetric}\` | **Significance:** ${f.significanceScore}/10\n\n`;
    md += `${f.summary}\n\n`;
  });
  md += `---\n\n`;

  md += `## Visual Story Chapters\n\n`;
  story.storyChapters.forEach((ch) => {
    md += `### Chapter ${ch.chapterNumber}: ${ch.title}\n`;
    md += `**Impact Metric:** \`${ch.statBadge}\` | **Chart Type:** ${ch.chartType.toUpperCase()}\n\n`;
    md += `${ch.narrative}\n\n`;
    md += `**Chart Title:** ${ch.chartConfig.title}\n\n`;
    md += `| ${ch.chartConfig.xLabel || ch.chartConfig.xAxisKey} | ${ch.chartConfig.yLabel || ch.chartConfig.yAxisKey} |\n`;
    md += `| --- | --- |\n`;
    ch.chartConfig.data.slice(0, 10).forEach((d) => {
      md += `| ${d[ch.chartConfig.xAxisKey] || d.label} | ${d[ch.chartConfig.yAxisKey] || d.value} |\n`;
    });
    md += `\n> **Key Takeaway:** ${ch.takeaway}\n\n---\n\n`;
  });

  const safeFilename = `${story.datasetTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_story.md`;
  downloadFile(md, safeFilename, 'text/markdown;charset=utf-8');
}

export function exportAsJSON(story: DataStory, summary: DatasetSummary): void {
  const exportPayload = {
    metadata: {
      exportedAt: new Date().toISOString(),
      datasetName: summary.name,
      rowCount: summary.rowCount,
      columnCount: summary.columnCount,
    },
    dataHealth: story.dataHealth,
    columns: summary.columns,
    executiveSummary: story.executiveSummary,
    prioritizedFindings: story.prioritizedFindings,
    storyChapters: story.storyChapters,
    datasetPreview: summary.rawData.slice(0, 50),
  };

  const safeFilename = `${story.datasetTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_report.json`;
  downloadFile(JSON.stringify(exportPayload, null, 2), safeFilename, 'application/json;charset=utf-8');
}

export function exportAsCSV(summary: DatasetSummary): void {
  if (!summary.rawData || summary.rawData.length === 0) return;
  const headers = Object.keys(summary.rawData[0]);
  const lines = [headers.join(',')];

  for (const row of summary.rawData) {
    const values = headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
    });
    lines.push(values.join(','));
  }

  const safeFilename = `${summary.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_data.csv`;
  downloadFile(lines.join('\n'), safeFilename, 'text/csv;charset=utf-8');
}

export function exportAsHTML(story: DataStory, summary: DatasetSummary): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${story.datasetTitle} - AI Data Story</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; padding: 40px 20px; margin: 0; }
    .container { max-width: 860px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); padding: 48px; }
    h1 { font-size: 2.2rem; color: #0f172a; margin-bottom: 8px; }
    .meta { font-size: 0.9rem; color: #64748b; margin-bottom: 32px; }
    .hero-badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 0.85rem; margin-bottom: 24px; }
    .exec-box { background: #f1f5f9; border-left: 4px solid #3b82f6; padding: 20px 24px; border-radius: 8px; margin-bottom: 32px; }
    .exec-box h3 { margin-top: 0; color: #1e3a8a; }
    .chapter { border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .chapter-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; }
    .chapter-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; }
    .badge { background: #ecfdf5; color: #047857; font-weight: 700; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; }
    .narrative { color: #334155; font-size: 1rem; margin-bottom: 16px; }
    .takeaway { background: #f8fafc; border-left: 3px solid #10b981; padding: 10px 14px; font-size: 0.9rem; color: #065f46; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 0.9rem; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; color: #475569; }
    @media print { body { background: #fff; padding: 0; } .container { box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <span class="hero-badge">AI Data Story Report</span>
    <h1>${story.datasetTitle}</h1>
    <div class="meta">Generated: ${new Date(story.generatedAt).toLocaleString()} &bull; ${summary.rowCount} Rows &bull; ${summary.columnCount} Columns &bull; Health Score: ${story.dataHealth.score}/100</div>

    <div class="exec-box">
      <h3>Executive Summary</h3>
      <p><strong>${story.executiveSummary.keyHeadline}</strong></p>
      <ul>
        ${story.executiveSummary.criticalFindings.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <h4 style="margin-top:16px; margin-bottom:8px;">Strategic Next Steps</h4>
      <ul>
        ${story.executiveSummary.strategicRecommendations.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>

    <h2>Story Chapters</h2>
    ${story.storyChapters.map(ch => `
      <div class="chapter">
        <div class="chapter-header">
          <div class="chapter-title">Chapter ${ch.chapterNumber}: ${ch.title}</div>
          <span class="badge">${ch.statBadge}</span>
        </div>
        <p class="narrative">${ch.narrative}</p>
        <div class="takeaway"><strong>Key Takeaway:</strong> ${ch.takeaway}</div>
        <table>
          <thead>
            <tr>
              <th>${ch.chartConfig.xLabel || ch.chartConfig.xAxisKey}</th>
              <th>${ch.chartConfig.yLabel || ch.chartConfig.yAxisKey}</th>
            </tr>
          </thead>
          <tbody>
            ${ch.chartConfig.data.slice(0, 8).map(d => `
              <tr>
                <td>${d[ch.chartConfig.xAxisKey] || d.label}</td>
                <td>${d[ch.chartConfig.yAxisKey] || d.value}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

  const safeFilename = `${story.datasetTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_interactive_report.html`;
  downloadFile(html, safeFilename, 'text/html;charset=utf-8');
}
