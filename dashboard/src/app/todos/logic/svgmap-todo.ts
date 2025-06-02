import { fetchJson, SUPABASE_URL } from '../../tests/logic/test-utils';
import { getApiKey } from '../../tests/logic/test-utils';
import type { TodoItem } from './todo-item';
import { TodoGenerator } from './todo-generator';

export class SvgMapTodo implements TodoGenerator {
  public readonly name = 'Hike ohne SVG-Map';

  async getTodos(): Promise<TodoItem[]> {
    const supabaseKey = getApiKey();
    const { data: hikes } = await fetchJson(
      `${SUPABASE_URL}/rest/v1/hikes?select=id,name_de,svg_map,location`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );

    if (!Array.isArray(hikes)) throw new Error('Could not fetch hikes');

    const missing: TodoItem[] = [];

    for (const h of hikes) {
      if (
        !h.svg_map
        || typeof h.svg_map !== 'string'
        || !h.svg_map.trim()
        || h.svg_map.includes('stroke="#FFFFFF"')
      ) {
        missing.push({
          id: String(h.id),
          name: h.name_de,
          type: 'hike',
          wrongValue: h.svg_map,
          correctValue: '',
          canBeCorrected: h.location != null,
          reason: h.location != null ? '' : 'Keine Location',
          generator: this,
          actionText: 'Generieren',
        });
      }
    }

    return missing;
  }

  async fixTodo(id: string, correctValue: string): Promise<void> {
    const triggerUrl = 'https://cms.instaswiss.ch/flows/trigger/aadd8935-67b5-48c5-9633-230e650caef1';
    
    const response = await fetch(triggerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keys: [id],
      }),
    });
  }
}