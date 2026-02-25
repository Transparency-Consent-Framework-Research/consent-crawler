import { readFile } from 'node:fs/promises';
import { shuffle } from './shuffle.js';

export const make_target_list = async (filePath: string): Promise<Array<string>> => {
  const domains = await readFile(filePath, { encoding: 'utf8' });
  const domain_array = domains.split('\n').map(domain => domain.trim())
  // .slice(0,100)
  
  console.log(domain_array.slice(0,3));
  const urls = domain_array.map(domain => {
    return `https://${domain}`;
  });
  return shuffle(urls);
}