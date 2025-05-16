import { TestResult } from '../test-results.service';
import { getApiKey, fetchJson, fetchHikes, mapHikeIdToName } from './test-utils';

export class Step2TechnicalConditionalIntersectionTest {
  apiUrl = 'https://fiuchvggmjsegklpsgaq.supabase.co/functions/v1/filter-hikes';

  async run(): Promise<TestResult> {
    const supabaseUrl = 'https://fiuchvggmjsegklpsgaq.supabase.co';
    const supabaseKey = getApiKey();
    const hikes = await fetchHikes(supabaseUrl, supabaseKey);
    const publishedHikeIdToName = mapHikeIdToName(hikes);
    const technicalSet = new Set<string>();
    const conditionalSet = new Set<string>();
    for (const h of hikes) {
      if (h.technical_difficulty) technicalSet.add(h.technical_difficulty);
      if (h.conditional_difficulty) conditionalSet.add(h.conditional_difficulty);
    }
    const technicalValues = Array.from(technicalSet);
    const conditionalValues = Array.from(conditionalSet);
    let correct: string[] = [];
    let missing: string[] = [];
    let details: string[] = [];
    let checked = 0;
    for (const tech of technicalValues) {
      for (const cond of conditionalValues) {
        const expected = hikes.filter((h: any) => h.technical_difficulty === tech && h.conditional_difficulty === cond).map((h: any) => h.id);
        const payload = {
          json_data: { step2: { technisch: [tech], konditionell: [cond] } },
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
          missing.push(`technisch=${tech}&konditionell=${cond}`);
          details.push(`API error for technisch=${tech}&konditionell=${cond}: ${data.error || 'API error'}`);
          continue;
        }
        const returned = data.hike_ids;
        const missingIds = expected.filter((id: string) => !returned.includes(id));
        if (missingIds.length === 0 && expected.length > 0) {
          correct.push(`technisch=${tech}&konditionell=${cond}`);
          details.push(`OK: technisch=${tech}&konditionell=${cond}`);
        } else if (expected.length > 0) {
          missing.push(`technisch=${tech}&konditionell=${cond}`);
          details.push(`Missing hike(s) for technisch=${tech}&konditionell=${cond}: ${missingIds.map((id: string) => publishedHikeIdToName[id]).join(', ')}`);
        }
      }
    }
    if (checked === 0) {
      return {
        name: 'Filter by Technical & Conditional Difficulty (Intersection)',
        passed: false,
        message: 'No published hikes found for technical/conditional intersection',
      };
    }
    const passed = missing.length === 0;
    return {
      name: 'Filter by Technical & Conditional Difficulty (Intersection)',
      passed,
      message: `Correct: ${correct.join(', ') || 'none'} | Wrong: ${missing.join(', ') || 'none'}\nDetails:\n${details.join('\n')}`,
    };
  }
} 