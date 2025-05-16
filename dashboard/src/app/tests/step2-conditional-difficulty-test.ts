import { TestResult } from '../test-results.service';
import { getApiKey, fetchJson, fetchHikes, mapHikeIdToName } from './test-utils';

export class Step2ConditionalDifficultyTest {
  apiUrl = 'https://fiuchvggmjsegklpsgaq.supabase.co/functions/v1/filter-hikes';

  async run(): Promise<TestResult> {
    const supabaseUrl = 'https://fiuchvggmjsegklpsgaq.supabase.co';
    const supabaseKey = getApiKey();
    const hikes = await fetchHikes(supabaseUrl, supabaseKey);
    const publishedHikeIdToName = mapHikeIdToName(hikes);
    const conditionalSet = new Set<string>();
    for (const h of hikes) {
      if (h.conditional_difficulty) conditionalSet.add(h.conditional_difficulty);
    }
    const conditionalValues = Array.from(conditionalSet);
    let correct: string[] = [];
    let missing: string[] = [];
    let details: string[] = [];
    let checked = 0;
    for (const cond of conditionalValues) {
      const expected = hikes.filter((h: any) => h.conditional_difficulty === cond).map((h: any) => h.id);
      const payload = {
        json_data: { step2: { konditionell: [cond] } },
      };
      const { res, data } = await fetchJson(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify(payload),
      });
      checked++;
      if (!res.ok || !Array.isArray(data.hike_ids)) {
        missing.push(`konditionell=${cond}`);
        details.push(`API error for konditionell=${cond}: ${data.error || 'API error'}`);
        continue;
      }
      const returned = data.hike_ids;
      const missingIds = expected.filter((id: string) => !returned.includes(id));
      if (missingIds.length === 0 && expected.length > 0) {
        correct.push(`konditionell=${cond}`);
        details.push(`OK: konditionell=${cond}`);
      } else {
        missing.push(`konditionell=${cond}`);
        details.push(`Missing hike(s) for konditionell=${cond}: ${missingIds.map((id: string) => publishedHikeIdToName[id]).join(', ')}`);
      }
    }
    if (checked === 0) {
      return {
        name: 'Filter by Conditional Difficulty',
        passed: false,
        message: 'No published hikes found for conditional difficulty',
      };
    }
    const passed = missing.length === 0;
    return {
      name: 'Filter by Conditional Difficulty',
      passed,
      message: `Correct: ${correct.join(', ') || 'none'} | Wrong: ${missing.join(', ') || 'none'}\nDetails:\n${details.join('\n')}`,
    };
  }
} 