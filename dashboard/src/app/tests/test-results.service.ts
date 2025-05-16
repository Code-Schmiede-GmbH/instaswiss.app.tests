import { Injectable, signal } from '@angular/core';
import { Step1HighlightsTest } from './logic/step1-highlights-test';
import { Step0TypeFilterTest } from './logic/step0-type-filter-test';
import { Step2TechnicalDifficultyTest } from './logic/step2-technical-difficulty-test';
import { Step2ConditionalDifficultyTest } from './logic/step2-conditional-difficulty-test';
import { Step2TechnicalConditionalIntersectionTest } from './logic/step2-technical-conditional-intersection-test';
import { Step2EmptyArraySkipFilterTest } from './logic/step2-empty-array-skip-filter-test';
import { Step2HikeDurationTest } from './logic/step2-hike-duration-test';

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
      () => new Step0TypeFilterTest().run(),
      () => new Step1HighlightsTest().run(),
      () => new Step2TechnicalDifficultyTest().run(),
      () => new Step2ConditionalDifficultyTest().run(),
      () => new Step2TechnicalConditionalIntersectionTest().run(),
      () => new Step2EmptyArraySkipFilterTest().run(),
      () => new Step2HikeDurationTest().run(),
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
}
