//@ts-nocheck
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { glob } from 'glob';

import { BannerHandler } from './index.js';


// Import using dynamic module import
export const importHandlers = async (): Promise<BannerHandler[]> => {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    // const checksDirPath = path.join(__dirname, 'cmps/');
    // const checksDirPath = path.join(__dirname, 'cmps/');
    const checksDirPath = path.join(__dirname, 'banner_handler/cmps/');

    const globs = glob.sync(`${checksDirPath}/**/*.js`);

    const importedHandlers = await Promise.all(globs.map((filePath: string) => {
      const fileURL = pathToFileURL(filePath).href;
      return import(fileURL);
    }))

    return importedHandlers.filter((imported) => {
      return !!Object.keys(imported).length
    }).map(handler => Object.values(handler)[0]);
  } catch(e) {
    console.log('Error on importHandlers', e);
  }
}
