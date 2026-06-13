const COUNTRY_ABBR: Record<string, string> = {};

export function fmtCountry(country: string): string {
  return COUNTRY_ABBR[country] ?? country;
}

export function fmtCountries(countries: string[]): string {
  return countries.map(fmtCountry).join(', ');
}
