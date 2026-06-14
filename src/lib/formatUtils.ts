const COUNTRY_ABBR: Record<string, string> = {};

export function fmtCountry(country: string): string {
  return COUNTRY_ABBR[country] ?? country;
}

export function fmtCountries(countries: string[]): string {
  return countries.map(fmtCountry).join(', ');
}

// Parse 'YYYY-MM-DD' in local time — avoids the UTC-midnight → prev-day shift
export function parseLocalDate(d: string): Date {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day);
}
