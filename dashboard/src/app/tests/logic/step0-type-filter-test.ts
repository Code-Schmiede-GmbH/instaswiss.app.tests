import { TestResult } from '../test-results.service';
import { getApiKey, fetchJson, fetchHikes, mapHikeIdToName } from './test-utils';

export class Step0TypeFilterTest {
  apiUrl = 'https://fiuchvggmjsegklpsgaq.supabase.co/functions/v1/filter-hikes';

  async run(): Promise<TestResult> {
    const supabaseUrl = 'https://fiuchvggmjsegklpsgaq.supabase.co';
    const supabaseKey = getApiKey();

    // 1. Get all hike types
    const { data: types } = await fetchJson(
      `${supabaseUrl}/rest/v1/types?select=id,name_de`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );

    // 2. Get all published hikes
    const hikes = await fetchHikes(supabaseUrl, supabaseKey);
    const publishedHikeIdToName = mapHikeIdToName(hikes);

    // 3. For each type, find published hikes with that type
    let correct: string[] = [];
    let missing: string[] = [];
    let details: string[] = [];
    let checked = 0;
    for (const type of types) {
      const hikeIdsForType = hikes
        .filter(
          (h: any) => h.hike_type_id === type.id
        )
        .map((h: any) => h.id);
      if (hikeIdsForType.length === 0) continue;
      // Get expected hike names
      const expectedNames = hikeIdsForType
        .map((id: string) => publishedHikeIdToName[id])
        .filter(Boolean);

      // 4. Call the filter API
      const payload = {
        json_data: { step0: { selectedType: [type.id] } },
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
        missing.push(type.name_de);
        details.push(
          `API error for ${type.name_de}: ${data.error || 'API error'}`,
        );
        continue;
      }
      if (!Array.isArray(data.hike_ids)) {
        missing.push(type.name_de);
        details.push(`No hike_ids array in response for ${type.name_de}`);
        continue;
      }
      // 5. Fetch hike names for returned hike_ids
      const returnedNames = data.hike_ids
        .map((id: string) => publishedHikeIdToName[id])
        .filter(Boolean);
      const missingNames = expectedNames.filter(
        (name: string) => !returnedNames.includes(name),
      );
      if (missingNames.length === 0 && expectedNames.length > 0) {
        correct.push(type.name_de);
        details.push(`Type OK: ${type.name_de}`);
      } else {
        missing.push(type.name_de);
        details.push(
          `Missing hike(s) for type ${type.name_de}: ${missingNames.join(', ')}`,
        );
      }
    }
    if (checked === 0) {
      return {
        name: 'Filtern nach Wandertyp',
        passed: false,
        message: 'Keine veröffentlichten Wanderungen mit einem Typ gefunden',
      };
    }
    const passed = missing.length === 0;
    return {
      name: 'Filtern nach Wandertyp',
      passed,
      message: `Korrekt: ${correct.join(', ') || 'keine'} | Falsch: ${missing.join(', ') || 'keine'}\nDetails:\n${details.join('\n')}`,
    };
  }
} 