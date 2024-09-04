import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const commanderHandler:BannerHandler = {
  name: 'Commander',
  url: 'https://www.commandersact.com/',
  cmpId: 90,
  variants: [
    {
      name: 'No Settings-Variant',
      check: async(page: Page) => !!(await page.locator('button[title="Refuse all"],button[title="Refuser tous les cookies"],button[title="JE REFUSE"],button[title="I REFUSE"]').count()),
      accept: async (page: Page) => {
          await page.locator('button[title="Accepter"],button[title="Tout accepter"],button[title="ACCEPT AND CLOSE"],button[title="Accept all"],button[title="Autoriser tous les cookies"]').click();
          page;
      },
      reject: async (page: Page) => {
          await page.locator('button[title="Refuse all"],button[title="Refuser tous les cookies",button[title="JE REFUSE"],button[title="I REFUSE"]').click();
          console.log('Rejected Succesfully.');
      }
    },
    {
        name: 'Continue without accepting-Variant',
        check: async(page: Page) => !!(await page.locator('button[title="CONTINUE WITHOUT ACCEPTING"],button[title*="Continuer sans accepter"],button[title="CONTINUER SANS ACCEPTER"]').count()),
        accept: async (page: Page) => {
            await page.locator('button[title="Accepter"],button[title="Tout accepter"],button[title="ACCEPT AND CLOSE"],button[title="Accept all"],button[title="Autoriser tous les cookies"],button[title="ACCEPTER ET FERMER"]').click();
            page;
        },
        reject: async (page: Page) => {
            await page.locator('button[title="CONTINUE WITHOUT ACCEPTING"],button[title*="Continuer sans accepter"],button[title="CONTINUER SANS ACCEPTER"]').click();
            console.log('Rejected Succesfully.');
        }
      }
  ]
}