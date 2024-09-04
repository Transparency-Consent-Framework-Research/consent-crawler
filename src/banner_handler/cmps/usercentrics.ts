import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const usercentricsHandler:BannerHandler = {
  name: 'Usercentrica',
  url: 'https://usercentrics.com/de/consent-management-platform-powered-by-usercentrics/',
  cmpId: 5,
  variants: [
    {
      name: 'No Settings-Variant',
      check: async(page: Page) => !!(await page.locator('button[data-testid="uc-deny-all-button"]').count()),
      accept: async (page: Page) => {
          await page.locator('button[data-testid="uc-accept-all-button"]').click();
          page;
      },
      reject: async (page: Page) => {
          await page.locator('button[data-testid="uc-deny-all-button"]').click();
          console.log('Rejected Succesfully.');
      }
    },
    {
        name: 'Settings-Variant',
        check: async(page: Page) => !!(await page.locator('button[data-testid="uc-customize-button"]').count()),
        accept: async (page: Page) => {
            await page.locator('button[data-testid="uc-accept-all-button"]').click();
            page;
        },
        reject: async (page: Page) => {
            await page.locator('button[data-testid="uc-customize-button"]').click();
            await page.waitForTimeout(3000);
            await page.locator('button[data-testid="uc-save-button"]').click();
            console.log('Rejected Succesfully.');
        }
      }
  ]
}