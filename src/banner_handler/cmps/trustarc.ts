import { Page } from 'playwright';

export const trustArcHandler = {
  name: 'TrustArc',
  url: 'consent.trustarc.com/notice',
  variants: [
    [
      {
        name: 'Bottom Fixed Modal',
        check: async (page: Page) => {
          page;
          return true;
        },
        accept: async (page: Page) => {
          page;
        },
        reject: async (page: Page) => {
          await page.locator('button#truste-show-consent').click();
          await page.waitForTimeout(3000);
          const iframeP = page.frameLocator('.truste_box_overlay .truste_box_overlay_inner .truste_popframe');
          await iframeP.locator('.mainContent a.rejectAll').click();
        }
      }
    ]
  ]
}