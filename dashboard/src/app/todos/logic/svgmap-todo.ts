import { fetchJson, SUPABASE_URL } from '../../tests/logic/test-utils';
import { getApiKey } from '../../tests/logic/test-utils';
import type { TodoItem } from './todo-item';
import { TodoGenerator } from './todo-generator';
import { TodoService } from '../todo.service';

export class SvgMapTodo implements TodoGenerator {
  public readonly name = 'Hike ohne SVG-Map';
  private cachedTodos: TodoItem[] = [];
  private todoService: TodoService;

  constructor(todoService: TodoService) {
    this.todoService = todoService;
  }

  async getTodos(cached: boolean): Promise<TodoItem[]> {
    if (cached && this.cachedTodos.length > 0) {
      return this.cachedTodos;
    }

    const supabaseKey = getApiKey();
    const { data: hikes } = await fetchJson(
      `${SUPABASE_URL}/rest/v1/hikes?select=id,name_de,svg_map,location,creator_id`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );

    if (!Array.isArray(hikes)) throw new Error('Could not fetch hikes');

    const items: TodoItem[] = [];

    for (const h of hikes) {
      const creator = this.todoService.creators().find(c => c.id === h.creator_id);
      
      // if (
      //   !h.svg_map
      //   || typeof h.svg_map !== 'string'
      //   || !h.svg_map.trim()
      //   || h.svg_map.includes('stroke="#FFFFFF"')
      // ) {
        items.push({
          id: String(h.id),
          name: h.name_de,
          creator: creator?.nickname || '',
          type: 'hike',
          wrongValue: h.svg_map,
          correctValue: '',
          canBeCorrected: h.location != null,
          reason: h.location != null ? '' : 'Keine Location',
          generator: this,
          actionText: 'Generieren',
          isAction: true,
        });
      // }
    }

    this.cachedTodos = items;

    return this.cachedTodos;
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