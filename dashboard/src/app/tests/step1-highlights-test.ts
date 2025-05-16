import { TestResult } from '../test-results.service';
import { getApiKey, fetchJson, fetchHikes, mapHikeIdToName } from './test-utils';

export class Step1HighlightsTest {
  apiUrl = 'https://fiuchvggmjsegklpsgaq.supabase.co/functions/v1/filter-hikes';

  async run(): Promise<TestResult> {
    const supabaseUrl = 'https://fiuchvggmjsegklpsgaq.supabase.co';
    const supabaseKey = getApiKey();

    // 1. Get all highlights
    const { data: highlights } = await fetchJson(
      `${supabaseUrl}/rest/v1/highlights?select=id,name_de`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );

    // 2. Get all hikes_highlights
    const { data: hikesHighlights } = await fetchJson(
      `${supabaseUrl}/rest/v1/hikes_highlights?select=hikes_id,highlights_id`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );

    // 3. Get all published hikes
    const hikes = await fetchHikes(supabaseUrl, supabaseKey);
    const publishedHikeIdToName = mapHikeIdToName(hikes);
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
        json_data: { step1: { selectedType: [highlight.id] } },
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
        name: 'Filtern nach Highlights',
        passed: false,
        message: 'Keine veröffentlichten Wanderungen mit einem Highlight gefunden',
      };
    }
    const passed = missing.length === 0;
    return {
      name: 'Filtern nach Highlights',
      passed,
      message: `Korrekt: ${correct.join(', ') || 'keine'} | Falsch: ${missing.join(', ') || 'keine'}\nDetails:\n${details.join('\n')}`,
    };
  }
}