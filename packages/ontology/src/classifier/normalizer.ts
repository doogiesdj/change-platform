import { SYNONYM_DICTIONARY } from '../dictionaries/synonyms';

export function normalize(text: string): string {
  let result = text.toLowerCase().replace(/\s+/g, '');
  for (const [synonym, canonical] of Object.entries(SYNONYM_DICTIONARY)) {
    result = result.replace(new RegExp(synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), canonical);
  }
  return result;
}
