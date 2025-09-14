import { getApiKey, fetchJson, SUPABASE_URL } from '../../tests/logic/test-utils';
import type { TodoGenerator } from './todo-generator';
import type { TodoItem } from './todo-item';


export class HikeSharpSStoSSTodoGenerator implements TodoGenerator {
  public readonly name = 'Hike: ß → ss in Textfeldern';
  private cachedTodos: TodoItem[] = [];
  private todoService: any;

  constructor(todoService: any) {
    this.todoService = todoService;
  }

  async getTodos(cached: boolean): Promise<TodoItem[]> {
    if (cached && this.cachedTodos.length > 0) {
      return this.cachedTodos;
    }

    const supabaseKey = getApiKey();
    // Table configs: table, columns, displayName, extraFields for display
    const tableConfigs = [
      {
        table: 'hikes',
        columns: [
          'name_neutral_de',
          'short_description',
          'detail_route',
          'travel_hint_car',
          'travel_hint_train',
        ],
        displayName: 'Hike',
        idField: 'id',
        nameField: 'name_de',
        creatorField: 'creator_id',
        type: 'hike',
      },
      {
        table: 'accomodations',
        columns: ['description', 'additional_info'],
        displayName: 'Accomodation',
        idField: 'id',
        nameField: 'name',
        type: 'accomodation',
      },
      {
        table: 'cable_cars',
        columns: ['description', 'additional_info'],
        displayName: 'Cable Car',
        idField: 'id',
        nameField: 'name',
        type: 'cable_car',
      },
      {
        table: 'catering_facilities',
        columns: ['description', 'additional_info'],
        displayName: 'Catering Facility',
        idField: 'id',
        nameField: 'name',
        type: 'catering_facility',
      },
    ];

    const items: TodoItem[] = [];
    // Fetch all tables in parallel
    const fetches = tableConfigs.map(cfg =>
      fetchJson(
        `${SUPABASE_URL}/rest/v1/${cfg.table}?select=${[cfg.idField, cfg.nameField, ...cfg.columns, ...(cfg.creatorField ? [cfg.creatorField] : [])].join(',')}`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      ).then(({ data }) => ({ data, cfg }))
    );
    const results = await Promise.all(fetches);

    for (const { data: rows, cfg } of results) {
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        for (const col of cfg.columns) {
          const val = row[col];
          if (typeof val === 'string' && val.includes('ß')) {
            const creator = cfg.creatorField ? this.todoService.creators().find((c: any) => c.id === row[cfg.creatorField]) : undefined;
            items.push({
              id: `${cfg.table}:${row[cfg.idField]}:${col}`,
              name: row[cfg.nameField],
              creator: creator?.nickname || '',
              type: cfg.type,
              wrongValue: val,
              correctValue: val.replace(/ß/g, 'ss'),
              canBeCorrected: true,
              reason: `${cfg.displayName} field ${col} enthält ß`,
              generator: this,
              actionText: 'Ersetze ß durch ss',
              isAction: true,
            });
          }
        }
      }
    }
    this.cachedTodos = items;
    return this.cachedTodos;
  }

  async fixTodo(id: string, correctValue: string): Promise<void> {
    // id is in the format "table:hikeId:column"
    const [table, rowId, column] = id.split(':');
    if (!table || !rowId || !column) throw new Error('Invalid todo id');
    const supabaseKey = getApiKey();
    const url = `${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(rowId)}`;
    const body: any = {};
    body[column] = correctValue;
    const { res, data } = await fetchJson(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(data?.message || `Failed to update ${column}`);
    }
  }
}
