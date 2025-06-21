import { getApiKey, fetchJson, SUPABASE_URL } from '../../tests/logic/test-utils';
import type { TodoItem } from './todo-item';
import type { TodoGenerator } from './todo-generator';

export class PhoneNumberFormatTodoGenerator implements TodoGenerator {
  public readonly name = 'Telefonnummern korrigieren';
  private cachedTodos: TodoItem[] = [];

  async getTodos(cached: boolean): Promise<TodoItem[]> {
    if (cached && this.cachedTodos.length > 0) {
      return this.cachedTodos;
    }

    const supabaseKey = getApiKey();
    const { data: accomodations } = await fetchJson(
      `${SUPABASE_URL}/rest/v1/accomodations?select=id,name,phone_number`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );
    if (!Array.isArray(accomodations)) {
      throw new Error('Could not fetch accomodations');
    }
    const wrong = accomodations.filter(
      (a: any) => typeof a.phone_number !== 'string' || !this.isSwissPhoneNumber(a.phone_number)
    );
    
    this.cachedTodos = wrong.map((a: any) => ({
      id: a.id,
      name: a.name,
      type: 'accomodation',
      wrongValue: a.phone_number,
      correctValue: '',
      canBeCorrected: true,
      reason: '',
      generator: this,
      actionText: 'Verbessern',
      isAction: false,
    }));

    return this.cachedTodos;
  }

  async fixTodo(id: string, correctValue: string): Promise<void> {
    const supabaseKey = getApiKey();
    const url = `${SUPABASE_URL}/rest/v1/accomodations?id=eq.${encodeURIComponent(id)}`;
    const { res, data } = await fetchJson(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ phone_number: correctValue }),
    });
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to update phone_number');
    }
  }

  private isSwissPhoneNumber(phone: string): boolean {
    // Regex: +41 followed by space, then numbers (with optional spaces)
    const swissPhoneRegex = /^\+41(\s|\d){9,}$/;
    return swissPhoneRegex.test(phone.replace(/\s+/g, ' '));
  }
}