import { fetchJson, SUPABASE_URL } from '../../tests/logic/test-utils';
import { getApiKey } from '../../tests/logic/test-utils';
import type { TodoItem } from './todo-item';
import { TodoGenerator } from './todo-generator';
import { TodoService } from '../todo.service';

export class WebcamUrlImageTodoGenerator implements TodoGenerator {
  public readonly name = 'Webcam-URL auf Bild prüfen';
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
      `${SUPABASE_URL}/rest/v1/hikes?select=id,name_de,webcam_url,creator_id`,
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
      if (!h.webcam_url || typeof h.webcam_url !== 'string') continue;

      const url = h.webcam_url.trim();
      if (!url) continue;

      const valid = this.isValidImageUrl(url);
      if (!valid) {
        const creator = this.todoService.creators().find(c => c.id === h.creator_id);

        items.push({
          id: String(h.id),
          name: h.name_de,
          creator: creator?.nickname || '',
          type: 'hike',
          wrongValue: h.webcam_url,
          correctValue: '',
          canBeCorrected: true,
          reason: '',
          generator: this,
          actionText: 'Verbessern',
          isAction: false,
        });
      }
    }

    this.cachedTodos = items;

    return this.cachedTodos;
  }

  async fixTodo(id: string, correctValue: string): Promise<void> {
    const supabaseKey = getApiKey();
    const url = `${SUPABASE_URL}/rest/v1/hikes?id=eq.${encodeURIComponent(id)}`;
    const { res, data } = await fetchJson(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ webcam_url: correctValue }),
    });
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to update webcam_url');
    }
  }

  private isValidImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url.split('?')[0])
      || url.startsWith('https://api.windy.com');
  }
} 