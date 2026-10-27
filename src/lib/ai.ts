export interface AIStructuredDraft {
  title: string;
  description: string;
  category: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggested_department: string; // SANITATION, PUBLIC_WORKS, WATER_SUPPLY, STREET_LIGHTING
  plain_language_rights: string;
}

const CITIZEN_CHARTER_RIGHTS: Record<string, string> = {
  WATER_SUPPLY:
    'Under the Goa (Right of Citizens to Time-Bound Delivery of Public Services) Act, 2013 & PWD Division III (Khandepar Water Works), potable water feeder breaches require emergency containment within 8 hours. Ponda Municipal Council mandates free potable tanker dispatch if supply interruption exceeds 12 hours.',
  PUBLIC_WORKS:
    'Under the Goa Right to Public Services Act 2013 & PWD Works Division XIV (Ponda Roads), potholes and hazardous asphalt cave-ins on municipal corridors must be barricaded within 4 hours and bitumen-compacted within 48 to 72 hours.',
  SANITATION:
    'Under the Ponda Municipal Council Solid Waste Bye-Laws & Clean Goa Mission, commercial market dump blackspots and uncollected organic/dry waste require mandatory clearance within 24 hours of notification.',
  STREET_LIGHTING:
    'Under Goa Electricity Department (Sub-Station Ponda) Service Standards, luminaire failures and dark pedestrian corridors must be restored within 24 to 48 hours; exposed conductor hazards require immediate 2-hour emergency isolation.',
};

/**
 * Intelligent municipal heuristic classifier for zero-API-key local execution
 * Grounded in Ponda Municipal Council, Goa jurisdiction
 */
export function classifyCivicIssueHeuristic(rawInput: string): AIStructuredDraft {
  const text = rawInput.toLowerCase();

  // Water supply & drainage checks
  if (
    text.includes('water') ||
    text.includes('pipe') ||
    text.includes('leak') ||
    text.includes('burst') ||
    text.includes('tap') ||
    text.includes('khandepar') ||
    text.includes('drinking')
  ) {
    const isCritical =
      text.includes('burst') || text.includes('flooding') || text.includes('gushing') || text.includes('rupture');
    return {
      title: isCritical
        ? 'Urgent Drinking Water Feeder Pipeline Rupture (Khandepar Feeder)'
        : 'Water Pipeline Leakage / Low Pressure Concern',
      description: rawInput.trim(),
      category: 'Water Leakage / Pipe Burst',
      urgency: isCritical ? 'CRITICAL' : 'HIGH',
      suggested_department: 'WATER_SUPPLY',
      plain_language_rights: CITIZEN_CHARTER_RIGHTS.WATER_SUPPLY,
    };
  }

  // Street lighting
  if (
    text.includes('light') ||
    text.includes('lamp') ||
    text.includes('pole') ||
    text.includes('dark') ||
    text.includes('wire') ||
    text.includes('illumination')
  ) {
    const hasLiveWire = text.includes('wire') || text.includes('shock') || text.includes('exposed');
    return {
      title: hasLiveWire
        ? 'Hazardous Exposed Electrical Conductor / Pole Short-Circuit'
        : 'Non-Functional Streetlight Luminaire Outage',
      description: rawInput.trim(),
      category: 'Streetlight Outage',
      urgency: hasLiveWire ? 'CRITICAL' : 'MEDIUM',
      suggested_department: 'STREET_LIGHTING',
      plain_language_rights: CITIZEN_CHARTER_RIGHTS.STREET_LIGHTING,
    };
  }

  // Sanitation & Solid Waste
  if (
    text.includes('garbage') ||
    text.includes('waste') ||
    text.includes('trash') ||
    text.includes('dump') ||
    text.includes('smell') ||
    text.includes('stench') ||
    text.includes('litter') ||
    text.includes('bazar') ||
    text.includes('market') ||
    text.includes('debris')
  ) {
    const isHuge = text.includes('commercial') || text.includes('market') || text.includes('fish');
    return {
      title: 'Unattended Market Waste Dump & Blackspot Accumulation',
      description: rawInput.trim(),
      category: 'Garbage & Waste Accumulation',
      urgency: isHuge ? 'HIGH' : 'MEDIUM',
      suggested_department: 'SANITATION',
      plain_language_rights: CITIZEN_CHARTER_RIGHTS.SANITATION,
    };
  }

  // Drainage & Sewer Overflow
  if (
    text.includes('drain') ||
    text.includes('sewer') ||
    text.includes('gutter') ||
    text.includes('overflow') ||
    text.includes('manhole') ||
    text.includes('choked') ||
    text.includes('nullah')
  ) {
    const isOpenManhole = text.includes('open') || text.includes('missing') || text.includes('broken cover');
    return {
      title: isOpenManhole
        ? 'Hazardous Open Roadside Drain / Missing Chamber Slab'
        : 'Choked Municipal Stormwater Drain & Nullah Overflow',
      description: rawInput.trim(),
      category: 'Drainage & Sewer Overflow',
      urgency: isOpenManhole ? 'CRITICAL' : 'HIGH',
      suggested_department: 'PUBLIC_WORKS',
      plain_language_rights: CITIZEN_CHARTER_RIGHTS.PUBLIC_WORKS,
    };
  }

  // Default to Road Engineering / Public Works (Potholes, footpaths, roads)
  const isDangerousRoad =
    text.includes('skid') || text.includes('accident') || text.includes('deep') || text.includes('crater');
  return {
    title: isDangerousRoad
      ? 'Dangerous Road Asphalt Crater Damaging Commuter Transit'
      : 'Monsoon Pothole & Damaged Road Surface',
    description: rawInput.trim(),
    category: 'Pothole & Road Damage',
    urgency: isDangerousRoad ? 'HIGH' : 'MEDIUM',
    suggested_department: 'PUBLIC_WORKS',
    plain_language_rights: CITIZEN_CHARTER_RIGHTS.PUBLIC_WORKS,
  };
}

/**
 * Parses raw multimodal citizen report into structured civic draft
 * Checks for OPENAI_API_KEY; falls back to the smart municipal heuristic engine.
 */
export async function parseCivicIntakeDraft(rawText: string): Promise<AIStructuredDraft> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return classifyCivicIssueHeuristic(rawText);
  }

  try {
    const prompt = `You are the CityNova AI Civic Governance Engine for Ponda Municipal Council (PMC), Goa, India.
Analyze the citizen's report and respond strictly in valid JSON matching this schema:
{
  "title": "Concise, professional civic issue title in Ponda context",
  "description": "Cleaned up resident description preserving all key facts and locations",
  "category": "One of: Pothole & Road Damage, Garbage & Waste Accumulation, Water Leakage / Pipe Burst, Streetlight Outage, Illegal Encroachment, Drainage & Sewer Overflow",
  "urgency": "One of: LOW, MEDIUM, HIGH, CRITICAL",
  "suggested_department": "One of: SANITATION, PUBLIC_WORKS, WATER_SUPPLY, STREET_LIGHTING",
  "plain_language_rights": "Statutory entitlement citing Goa (Right of Citizens to Time-Bound Delivery of Public Services) Act, 2013 and Ponda Municipal Council Bye-Laws (1-2 sentences stating SLA rights)"
}

Citizen Report:
"${rawText}"`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      console.warn('OpenAI API returned error, using Ponda Municipal Council heuristic fallback.');
      return classifyCivicIssueHeuristic(rawText);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      return JSON.parse(content) as AIStructuredDraft;
    }
  } catch (error) {
    console.error('AI Draft parsing failed, using heuristic fallback:', error);
  }

  return classifyCivicIssueHeuristic(rawText);
}
