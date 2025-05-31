export function getApiKey(): string {
  return localStorage.getItem('apiKey') || '';
}

export async function fetchJson(url: string, options: any = {}): Promise<any> {
  const res = await fetch(url, options);
  const data = await res.json();
  return { res, data };
}

export async function fetchHikes(supabaseUrl: string, supabaseKey: string): Promise<any[]> {
  const { data } = await fetchJson(
    `${supabaseUrl}/rest/v1/hikes?select=id,name_de,editor_status,is_example,technical_difficulty,conditional_difficulty,hike_type_id,hike_duration_in_min`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    },
  );

  return data.filter((h: any) => !h.is_example && h.editor_status === 'published');
}

export function mapHikeIdToName(hikes: any[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const h of hikes) map[h.id] = h.name_de;
  return map;
}

export const SUPABASE_URL = 'https://fiuchvggmjsegklpsgaq.supabase.co';
export const API_URL = `${SUPABASE_URL}/functions/v1/filter-hikes`; 