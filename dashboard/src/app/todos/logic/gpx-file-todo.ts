import { getApiKey, fetchJson, SUPABASE_URL } from '../../tests/logic/test-utils';
import type { TodoItem } from './todo-item';
import type { TodoGenerator } from './todo-generator';
import { TodoService } from '../todo.service';

export class GpxFileTodoGenerator implements TodoGenerator {
  public readonly name = 'Fehlende GPX-Dateien';
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
      `${SUPABASE_URL}/rest/v1/hikes?select=id,name_de,gpx_file,creator_id`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );
    if (!Array.isArray(hikes)) {
      throw new Error('Could not fetch hikes');
    }

    const wrongHikes: any[] = [];
    for (const h of hikes) {
      const hikeName = h.name_de;
      if (typeof h.gpx_file !== 'string' || h.gpx_file.trim() === '') {
        wrongHikes.push({
          ...h,
          name: hikeName,
          reason: 'GPX-Datei fehlt.',
        });
        continue;
      }

      try {
        const directusFilesUrl = `${SUPABASE_URL}/rest/v1/directus_files?select=filename_disk&id=eq.${h.gpx_file}`;
        const { data: files, res: filesRes } = await fetchJson(directusFilesUrl, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        });

        if (!filesRes.ok || !Array.isArray(files) || files.length === 0 || !files[0].filename_disk) {
          wrongHikes.push({
            ...h,
            name: hikeName,
            reason: `Kein Eintrag in directus_files für ID ${h.gpx_file} gefunden.`,
          });
          continue;
        }

        const filename_disk = files[0].filename_disk;
        const fileUrl = `${SUPABASE_URL}/storage/v1/object/public/assets/${filename_disk}`;
        const response = await fetch(fileUrl);

        if (!response.ok) {
          wrongHikes.push({
            ...h,
            name: hikeName,
            reason: `GPX-Datei konnte nicht heruntergeladen werden (Status: ${response.status}).`,
          });
          continue;
        }

        const gpxContent = await response.text();
        if (!gpxContent.includes('<gpx')) {
          wrongHikes.push({
            ...h,
            name: hikeName,
            reason: `${gpxContent.substring(0, 10)}...: Die heruntergeladene Datei ist keine gültige GPX-Datei.`,
          });
        }
      } catch (error) {
        wrongHikes.push({
          ...h,
          name: hikeName,
          reason: 'Fehler beim Überprüfen der GPX-Datei.',
        });
      }
    }

    this.cachedTodos = await Promise.all(wrongHikes.map(async (h: any) => {
      const creator = this.todoService.creators().find(c => c.id === h.creator_id);

      return ({
        id: h.id,
        name: h.name,
        creator: creator?.nickname || '',
        type: 'hike',
        wrongValue: h.reason,
        correctValue: '',
        canBeCorrected: false,
        reason: h.reason,
        generator: this,
        actionText: 'Korrekte GPX-Datei in Directus hochladen',
        isAction: false,
      });
    }));

    return this.cachedTodos;
  }

  async fixTodo(id: string, correctValue: string): Promise<void> {}
} 