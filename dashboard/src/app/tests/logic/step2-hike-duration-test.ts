import { TestResult } from '../test-results.service';
import { BaseHikeTest } from './base-hike-test';
import { mapHikeIdToName } from './test-utils';

export class Step2HikeDurationTest extends BaseHikeTest {
  async run(): Promise<TestResult> {
    const hikes = await this.getHikes();
    const publishedHikeIdToName = mapHikeIdToName(hikes);
    // Get all durations
    const durations = hikes.map((h: any) => h.hike_duration_in_min).filter((d: any) => typeof d === 'number');
    if (durations.length === 0) {
      return {
        name: 'Filtern nach Wanderungsdauer',
        passed: false,
        message: 'Keine Wanderungen mit hike_duration_in_min gefunden',
      };
    }
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    // Test cases: min only, max only, both, all
    const testCases = [
      { label: `min=${minDuration}`, payload: { minDuration } },
      { label: `max=${maxDuration}`, payload: { maxDuration } },
      { label: `min=${minDuration}&max=${maxDuration}`, payload: { minDuration, maxDuration } },
      { label: 'alle', payload: {} },
      // Add a mid-range test
      { label: 'mittlerer Bereich', payload: { minDuration: minDuration + 10, maxDuration: maxDuration - 10 } },
    ];
    let correct: string[] = [];
    let missing: string[] = [];
    let details: string[] = [];
    for (const test of testCases) {
      const { minDuration, maxDuration } = test.payload;
      // Compute expected
      const expected = hikes.filter((h: any) => {
        const dur = h.hike_duration_in_min;
        if (typeof dur !== 'number') return false;
        if (minDuration !== undefined && dur < minDuration) return false;
        if (maxDuration !== undefined && dur > maxDuration) return false;
        return true;
      }).map((h: any) => h.id);
      const payload = { json_data: { step2: { minDuration, maxDuration } } };
      const { res, data } = await this.postJson(payload);
      if (!res.ok || !Array.isArray(data.hike_ids)) {
        missing.push(test.label);
        details.push(`API-Fehler für ${test.label}: ${data.error || 'API-Fehler'}`);
        continue;
      }
      const returned = data.hike_ids;
      const missingIds = expected.filter((id: string) => !returned.includes(id));
      if (missingIds.length === 0 && expected.length > 0) {
        correct.push(test.label);
        details.push(`OK: ${test.label}`);
      } else {
        missing.push(test.label);
        details.push(`Fehlende Wanderung(en) für ${test.label}: ${missingIds.map((id: string) => publishedHikeIdToName[id]).join(', ')}`);
      }
    }
    const passed = missing.length === 0;
    return {
      name: 'Filtern nach Wanderungsdauer',
      passed,
      message: `Korrekt: ${correct.join(', ') || 'keine'} | Falsch: ${missing.join(', ') || 'keine'}\nDetails:\n${details.join('\n')}`,
    };
  }
} 