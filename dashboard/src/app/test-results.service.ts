import { Injectable, signal } from '@angular/core';
import { Step0HighlightsTest } from './tests/step0-highlights-test';

export interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class TestResultsService {
  apiUrl = 'https://fiuchvggmjsegklpsgaq.supabase.co/functions/v1/filter-hikes';

  async runAllTests(): Promise<TestResult[]> {
    const tests: (() => Promise<TestResult>)[] = [
      () => new Step0HighlightsTest().run(),
      this.testFilterByStep1SelectedHighlights.bind(this),
      this.testFilterByStep2TechnischAndDuration.bind(this),
      this.testInvalidQueryParams.bind(this),
    ];
    const results: TestResult[] = [];
    for (const test of tests) {
      try {
        results.push(await test());
      } catch (e: any) {
        results.push({
          name: test.name,
          passed: false,
          message: e?.message || 'Exception',
        });
      }
    }
    return results;
  }

  private getApiKey(): string {
    return localStorage.getItem('apiKey') || '';
  }

  async testFilterByStep1SelectedHighlights(): Promise<TestResult> {
    // Replace 'some-highlight-uuid' with a real highlight UUID if you want a strict test
    const payload = {
      json_data: { step1: { selectedHighlights: ['some-highlight-uuid'] } },
    };
    const apiKey = this.getApiKey();
    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok)
      return {
        name: 'Filter by selectedHighlights',
        passed: false,
        message: data.error || 'API error',
      };
    if (Array.isArray(data.hike_ids) && data.hike_ids.length > 0) {
      return { name: 'Filter by selectedHighlights', passed: true };
    }
    return {
      name: 'Filter by selectedHighlights',
      passed: false,
      message: 'No hikes returned',
    };
  }

  async testFilterByStep2TechnischAndDuration(): Promise<TestResult> {
    // Replace 'T2' with a real technical_difficulty value if you want a strict test
    const payload = {
      json_data: {
        step2: { technisch: ['T2'], minDuration: 60, maxDuration: 180 },
      },
    };
    const apiKey = this.getApiKey();
    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok)
      return {
        name: 'Filter by technisch and duration',
        passed: false,
        message: data.error || 'API error',
      };
    if (Array.isArray(data.hike_ids) && data.hike_ids.length > 0) {
      return { name: 'Filter by technisch and duration', passed: true };
    }
    return {
      name: 'Filter by technisch and duration',
      passed: false,
      message: 'No hikes returned',
    };
  }

  async testInvalidQueryParams(): Promise<TestResult> {
    const payload = { json_data: { step1: { nonsense: true } } };
    const apiKey = this.getApiKey();
    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok && data.error) {
      return { name: 'Invalid query params', passed: true };
    }
    return {
      name: 'Invalid query params',
      passed: false,
      message: 'Did not return error for invalid params',
    };
  }
}
