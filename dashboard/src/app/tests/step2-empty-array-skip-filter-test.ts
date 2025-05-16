import { TestResult } from '../test-results.service';
import { getApiKey, fetchJson, fetchHikes, mapHikeIdToName } from './test-utils';

export class Step2EmptyArraySkipFilterTest {
  apiUrl = 'https://fiuchvggmjsegklpsgaq.supabase.co/functions/v1/filter-hikes';

  async run(): Promise<TestResult> {
    const supabaseUrl = 'https://fiuchvggmjsegklpsgaq.supabase.co';
    const supabaseKey = getApiKey();
    const hikes = await fetchHikes(supabaseUrl, supabaseKey);
    const publishedHikeIdToName = mapHikeIdToName(hikes);
    let correct: string[] = [];
    let missing: string[] = [];
    let details: string[] = [];
    let checked = 0;
    // technisch=[]
    const payloadEmptyTech = { json_data: { step2: { technisch: [] } } };
    const { res: resEmptyTech, data: dataEmptyTech } = await fetchJson(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(payloadEmptyTech),
    });
    checked++;
    if (Array.isArray(dataEmptyTech.hike_ids)) {
      const missingIds = hikes.map((h: any) => h.id).filter((id: string) => !dataEmptyTech.hike_ids.includes(id));
      if (missingIds.length === 0) {
        correct.push('technisch=[]');
        details.push('OK: technisch=[] (all hikes returned)');
      } else {
        missing.push('technisch=[]');
        details.push(`Missing hike(s) for technisch=[]: ${missingIds.map((id: string) => publishedHikeIdToName[id]).join(', ')}`);
      }
    } else {
      missing.push('technisch=[]');
      details.push('API error for technisch=[]');
    }
    // konditionell=[]
    const payloadEmptyCond = { json_data: { step2: { konditionell: [] } } };
    const { res: resEmptyCond, data: dataEmptyCond } = await fetchJson(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(payloadEmptyCond),
    });
    checked++;
    if (Array.isArray(dataEmptyCond.hike_ids)) {
      const missingIds = hikes.map((h: any) => h.id).filter((id: string) => !dataEmptyCond.hike_ids.includes(id));
      if (missingIds.length === 0) {
        correct.push('konditionell=[]');
        details.push('OK: konditionell=[] (all hikes returned)');
      } else {
        missing.push('konditionell=[]');
        details.push(`Missing hike(s) for konditionell=[]: ${missingIds.map((id: string) => publishedHikeIdToName[id]).join(', ')}`);
      }
    } else {
      missing.push('konditionell=[]');
      details.push('API error for konditionell=[]');
    }
    if (checked === 0) {
      return {
        name: 'Filter by Technical/Conditional Difficulty (Empty Array)',
        passed: false,
        message: 'No published hikes found for empty array skip filter',
      };
    }
    const passed = missing.length === 0;
    return {
      name: 'Filter by Technical/Conditional Difficulty (Empty Array)',
      passed,
      message: `Correct: ${correct.join(', ') || 'none'} | Wrong: ${missing.join(', ') || 'none'}\nDetails:\n${details.join('\n')}`,
    };
  }
} 