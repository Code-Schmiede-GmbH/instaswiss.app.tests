import { TestResult } from '../test-results.service';
import { getApiKey, fetchJson, fetchHikes, mapHikeIdToName } from './test-utils';

export class Step2TechnicalDifficultyTest {
  apiUrl = 'https://fiuchvggmjsegklpsgaq.supabase.co/functions/v1/filter-hikes';

  async run(): Promise<TestResult> {
    const supabaseUrl = 'https://fiuchvggmjsegklpsgaq.supabase.co';
    const supabaseKey = getApiKey();
    const hikes = await fetchHikes(supabaseUrl, supabaseKey);
    const publishedHikeIdToName = mapHikeIdToName(hikes);
    const technicalSet = new Set<string>();
    for (const h of hikes) {
      if (h.technical_difficulty) technicalSet.add(h.technical_difficulty);
    }
    const technicalValues = Array.from(technicalSet);
    let correct: string[] = [];
    let missing: string[] = [];
    let details: string[] = [];
    let checked = 0;
    for (const tech of technicalValues) {
      const expected = hikes.filter((h: any) => h.technical_difficulty === tech).map((h: any) => h.id);
      const payload = {
        json_data: { step2: { technisch: [tech] } },
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
        missing.push(`technisch=${tech}`);
        details.push(`API-Fehler für technisch=${tech}: ${data.error || 'API-Fehler'}`);
        continue;
      }
      const returned = data.hike_ids;
      const missingIds = expected.filter((id: string) => !returned.includes(id));
      if (missingIds.length === 0 && expected.length > 0) {
        correct.push(`technisch=${tech}`);
        details.push(`OK: technisch=${tech}`);
      } else {
        missing.push(`technisch=${tech}`);
        details.push(`Fehlende Wanderung(en) für technisch=${tech}: ${missingIds.map((id: string) => publishedHikeIdToName[id]).join(', ')}`);
      }
    }
    if (checked === 0) {
      return {
        name: 'Filtern nach technischer Schwierigkeit',
        passed: false,
        message: 'Keine veröffentlichten Wanderungen für technische Schwierigkeit gefunden',
      };
    }
    const passed = missing.length === 0;
    return {
      name: 'Filtern nach technischer Schwierigkeit',
      passed,
      message: `Korrekt: ${correct.join(', ') || 'keine'} | Falsch: ${missing.join(', ') || 'keine'}\nDetails:\n${details.join('\n')}`,
    };
  }
} 