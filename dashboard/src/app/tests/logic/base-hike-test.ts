import { SUPABASE_URL, API_URL, getApiKey, fetchHikes, fetchJson } from './test-utils';

export class BaseHikeTest {
  supabaseUrl = SUPABASE_URL;
  apiUrl = API_URL;
  supabaseKey = getApiKey();

  async getHikes() {
    return fetchHikes(this.supabaseUrl, this.supabaseKey);
  }

  async postJson(payload: any) {
    return fetchJson(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Apikey: this.supabaseKey,
        Authorization: `Bearer ${this.supabaseKey}`,
      },
      body: JSON.stringify(payload),
    });
  }
}
