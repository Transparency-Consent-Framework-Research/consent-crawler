import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const googleHandler:BannerHandler = {
  name: 'Google',
  url: 'google.com',
  cmpId: 300,
  variants: [
    {
      name: 'Do not consent Variant',
      check: async(page: Page) => !!(await page.locator('button.fc-button.fc-cta-do-not-consent.fc-secondary-button').count()),
      accept: async (page: Page) => {
          await page.locator('button.fc-button.fc-cta-consent.fc-primary-button').click();
          page;
      },
      reject: async (page: Page) => {
        await page.locator('button.fc-button.fc-cta-do-not-consent.fc-secondary-button').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Settings-Variant',
      check: async(page: Page) => !!(await page.locator('button.fc-button.fc-cta-manage-options.fc-secondary-button').count()),
      accept: async (page: Page) => {
        await page.locator('button.fc-button.fc-cta-consent.fc-primary-button').click();
          page;
      },
      reject: async (page: Page) => {
        await page.locator('button.fc-button.fc-cta-manage-options.fc-secondary-button').nth(0).click();
        await page.waitForTimeout(1000);
        await page.locator('button.fc-button.fc-confirm-choices.fc-primary-button').first().click();
        console.log('Rejected Succesfully.');
      }
    }
  ]
}