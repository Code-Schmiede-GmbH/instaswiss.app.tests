import { TestResult } from '../test-results.service';

export class Step0HighlightsTest {
  apiUrl = 'https://fiuchvggmjsegklpsgaq.supabase.co/functions/v1/filter-hikes';

  private getApiKey(): string {
    return localStorage.getItem('apiKey') || '';
  }

  async run(): Promise<TestResult> {
    const supabaseUrl = 'https://fiuchvggmjsegklpsgaq.supabase.co';
    const supabaseKey = this.getApiKey();

    // 1. Get all highlights
    const highlightsRes = await fetch(
      `${supabaseUrl}/rest/v1/highlights?select=id,name_de`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );
    const highlights = await highlightsRes.json();

    // 2. Get all hikes_highlights
    const hikesHighlightsRes = await fetch(
      `${supabaseUrl}/rest/v1/hikes_highlights?select=hikes_id,highlights_id`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );
    const hikesHighlights = await hikesHighlightsRes.json();

    // 3. Get all published hikes
    const hikesRes = await fetch(
      `${supabaseUrl}/rest/v1/hikes?select=id,name_de,state&state=eq.1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );
    const hikes = await hikesRes.json();
    // Map: id -> name_de for published hikes
    const publishedHikeIdToName: Record<string, string> = {};
    for (const h of hikes) publishedHikeIdToName[h.id] = h.name_de;
    const publishedHikeIds = new Set(hikes.map((h: any) => h.id));

    // 4. For each highlight, find published hikes with that highlight
    let correct: string[] = [];
    let missing: string[] = [];
    let details: string[] = [];
    let checked = 0;
    for (const highlight of highlights) {
      const hikeIdsForHighlight = hikesHighlights
        .filter(
          (hh: any) =>
            hh.highlights_id === highlight.id &&
            publishedHikeIds.has(hh.hikes_id),
        )
        .map((hh: any) => hh.hikes_id);
      if (hikeIdsForHighlight.length === 0) continue;
      // Get expected hike names
      const expectedNames = hikeIdsForHighlight
        .map((id: string) => publishedHikeIdToName[id])
        .filter(Boolean);

      // 5. Call the filter API
      const payload = {
        json_data: { step0: { selectedType: [highlight.id] } },
      };
      const res = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      checked++;
      if (!res.ok) {
        missing.push(highlight.name_de);
        details.push(
          `API error for ${highlight.name_de}: ${data.error || 'API error'}`,
        );
        continue;
      }
      if (!Array.isArray(data.hike_ids)) {
        missing.push(highlight.name_de);
        details.push(`No hike_ids array in response for ${highlight.name_de}`);
        continue;
      }
      // 6. Fetch hike names for returned hike_ids
      const returnedNames = data.hike_ids
        .map((id: string) => publishedHikeIdToName[id])
        .filter(Boolean);
      const missingNames = expectedNames.filter(
        (name: string) => !returnedNames.includes(name),
      );
      if (missingNames.length === 0 && expectedNames.length > 0) {
        correct.push(highlight.name_de);
        details.push(`Highlight OK: ${highlight.name_de}`);
      } else {
        missing.push(highlight.name_de);
        details.push(
          `Missing hike(s) for highlight ${highlight.name_de}: ${missingNames.join(', ')}`,
        );
      }
    }
    if (checked === 0) {
      return {
        name: 'Filter by selectedType',
        passed: false,
        message: 'No published hikes found with any highlight',
      };
    }
    const passed = missing.length === 0;
    return {
      name: 'Filter by selectedType',
      passed,
      message: `Correct: ${correct.join(', ') || 'none'} | Missing: ${missing.join(', ') || 'none'}\nDetails: ${details.join('\n')}`,
    };
  }
}
