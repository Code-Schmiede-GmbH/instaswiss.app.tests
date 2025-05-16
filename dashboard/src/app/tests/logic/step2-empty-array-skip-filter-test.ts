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
        details.push('OK: technisch=[] (alle Wanderungen zurückgegeben)');
      } else {
        missing.push('technisch=[]');
        details.push(`Fehlende Wanderung(en) für technisch=[]: ${missingIds.map((id: string) => publishedHikeIdToName[id]).join(', ')}`);
      }
    } else {
      missing.push('technisch=[]');
      details.push('API-Fehler für technisch=[]');
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
        details.push('OK: konditionell=[] (alle Wanderungen zurückgegeben)');
      } else {
        missing.push('konditionell=[]');
        details.push(`Fehlende Wanderung(en) für konditionell=[]: ${missingIds.map((id: string) => publishedHikeIdToName[id]).join(', ')}`);
      }
    } else {
      missing.push('konditionell=[]');
      details.push('API-Fehler für konditionell=[]');
    }
    if (checked === 0) {
      return {
        name: 'Filtern nach technischer/konditioneller Schwierigkeit (leeres Array)',
        passed: false,
        message: 'Keine veröffentlichten Wanderungen für leeres Array Skip-Filter gefunden',
      };
    }
    const passed = missing.length === 0;
    return {
      name: 'Filtern nach technischer/konditioneller Schwierigkeit (leeres Array)',
      passed,
      message: `Korrekt: ${correct.join(', ') || 'keine'} | Falsch: ${missing.join(', ') || 'keine'}\nDetails:\n${details.join('\n')}`,
    };
  }
} 