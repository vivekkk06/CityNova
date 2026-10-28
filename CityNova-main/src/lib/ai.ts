export interface AIStructuredDraft {
  title: string;
  description: string;
  category: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  plain_language_rights: string;
}

const GENERAL_REPORT_NOTE = 'This report is recorded in CityNova for status tracking. A local response deadline has not been configured.';

export function classifyCivicIssueHeuristic(rawInput: string): AIStructuredDraft {
  const text = rawInput.toLowerCase();
  const base = { description: rawInput.trim(), plain_language_rights: GENERAL_REPORT_NOTE };

  if (['water', 'pipe', 'leak', 'burst', 'tap', 'drinking'].some((word) => text.includes(word))) {
    const critical = ['burst', 'flooding', 'gushing', 'rupture'].some((word) => text.includes(word));
    return { ...base, title: critical ? 'Urgent Water Pipeline Rupture' : 'Water Pipeline Leakage', category: 'Water Leakage / Pipe Burst', urgency: critical ? 'CRITICAL' : 'HIGH' };
  }

  if (['light', 'lamp', 'pole', 'dark', 'wire', 'illumination'].some((word) => text.includes(word))) {
    const hazard = ['wire', 'shock', 'exposed'].some((word) => text.includes(word));
    return { ...base, title: hazard ? 'Exposed Electrical Wire or Pole Hazard' : 'Streetlight Outage', category: 'Streetlight Outage', urgency: hazard ? 'CRITICAL' : 'MEDIUM' };
  }

  if (['garbage', 'waste', 'trash', 'dump', 'smell', 'stench', 'litter', 'debris'].some((word) => text.includes(word))) {
    return { ...base, title: 'Uncollected Waste or Litter', category: 'Garbage & Waste Accumulation', urgency: text.includes('commercial') ? 'HIGH' : 'MEDIUM' };
  }

  if (['drain', 'sewer', 'gutter', 'overflow', 'manhole', 'choked'].some((word) => text.includes(word))) {
    const hazard = ['open', 'missing', 'broken cover'].some((word) => text.includes(word));
    return { ...base, title: hazard ? 'Open Drain or Missing Cover Hazard' : 'Drainage or Sewer Overflow', category: 'Drainage & Sewer Overflow', urgency: hazard ? 'CRITICAL' : 'HIGH' };
  }

  const urgent = ['skid', 'accident', 'deep', 'crater'].some((word) => text.includes(word));
  return { ...base, title: urgent ? 'Hazardous Road Damage' : 'Road Surface Damage', category: 'Pothole & Road Damage', urgency: urgent ? 'HIGH' : 'MEDIUM' };
}

export async function parseCivicIntakeDraft(rawText: string): Promise<AIStructuredDraft> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) return classifyCivicIssueHeuristic(rawText);

  try {
    const prompt = `Structure the citizen's report for a city-neutral civic issue reporting website. Do not assume local laws, officials, service guarantees, or city-specific processes. Respond with valid JSON matching this schema: {"title":"Concise title","description":"Cleaned description preserving facts","category":"One of Pothole & Road Damage, Garbage & Waste Accumulation, Water Leakage / Pipe Burst, Streetlight Outage, Illegal Encroachment, Drainage & Sewer Overflow","urgency":"LOW, MEDIUM, HIGH, or CRITICAL","plain_language_rights":"This report is recorded for status tracking. A local response deadline has not been configured."}\n\nCitizen report:\n${rawText}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' }, temperature: 0.2 }),
    });
    if (!response.ok) return classifyCivicIssueHeuristic(rawText);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) return JSON.parse(content) as AIStructuredDraft;
  } catch (error) {
    console.error('AI draft parsing failed, using the general civic classifier:', error);
  }
  return classifyCivicIssueHeuristic(rawText);
}
