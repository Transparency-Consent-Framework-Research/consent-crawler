import { readFile } from 'node:fs/promises';
import { shuffle } from './shuffle.js';

export const make_target_list = async (filePath: string): Promise<Array<string>> => {
  const domains = await readFile(filePath, { encoding: 'utf8' });
  const domain_array = domains.split('\n');
  const urls = domain_array.map(domain => {
    return `http://${domain}`;
  });
  return shuffle(urls);
}