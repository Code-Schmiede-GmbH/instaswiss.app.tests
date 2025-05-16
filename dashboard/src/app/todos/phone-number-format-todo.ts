import { getApiKey, fetchJson, SUPABASE_URL } from '../tests/test-utils';

export async function checkAccomodationPhoneNumbers() {
  const supabaseKey = getApiKey();
  const { data: accomodations } = await fetchJson(
    `${SUPABASE_URL}/rest/v1/accomodations?select=name,phone_number`,
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
  // Regex: +41 followed by space, then numbers (with optional spaces)
  const swissPhoneRegex = /^\+41(\s|\d){9,}$/;
  const wrong = accomodations.filter(
    (a: any) => typeof a.phone_number !== 'string' || !swissPhoneRegex.test(a.phone_number.replace(/\s+/g, ' '))
  );
  return wrong.map((a: any) => a.name);
}