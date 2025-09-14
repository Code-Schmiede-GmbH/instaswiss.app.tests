export function getApiKey(): string {
  return localStorage.getItem('apiKey') || '';
}

export async function fetchJson(url: string, options: any = {}): Promise<any> {
  const res = await fetch(url, options);
  const data = await res.json();
  return { res, data };
}

export class HikeWithCreator {
  id: string;
  name_de: string;
  editor_status: string;
  is_example: boolean;
  technical_difficulty: any;
  conditional_difficulty: any;
  hike_type_id: any;
  hike_duration_in_min: any;
  creator_id: string;
  date_created: string;
  creator: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    [key: string]: any;
  };
  constructor(hike: any) {
    this.id = hike.id;
    this.name_de = hike.name_de;
    this.editor_status = hike.editor_status;
    this.is_example = hike.is_example;
    this.technical_difficulty = hike.technical_difficulty;
    this.conditional_difficulty = hike.conditional_difficulty;
    this.hike_type_id = hike.hike_type_id;
    this.hike_duration_in_min = hike.hike_duration_in_min;
    this.creator_id = hike.creator_id;
    this.date_created = hike.date_created;
    this.creator = hike.directus_users;
  }
}

export async function fetchHikes(
  supabaseUrl: string,
  supabaseKey: string,
): Promise<HikeWithCreator[]> {
  const { data } = await fetchJson(
    `${supabaseUrl}/rest/v1/hikes?select=id,name_de,editor_status,is_example,technical_difficulty,conditional_difficulty,hike_type_id,hike_duration_in_min,creator_id,date_created,directus_users!hikes_creator_id_foreign(id,first_name,last_name,email)`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    },
  );

  return data
    .filter((h: any) => h.editor_status === 'published')
    .map((h: any) => new HikeWithCreator(h));
}

export async function fetchAllHikes(
  supabaseUrl: string,
  supabaseKey: string,
): Promise<number> {
  const { data } = await fetchJson(`${supabaseUrl}/rest/v1/hikes?select=id`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  return data.length;
}

export function mapHikeIdToName(hikes: any[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const h of hikes) map[h.id] = h.name_de;
  return map;
}

export const SUPABASE_URL = 'https://fiuchvggmjsegklpsgaq.supabase.co';
export const API_URL = `${SUPABASE_URL}/functions/v1/filter-hikes`;
