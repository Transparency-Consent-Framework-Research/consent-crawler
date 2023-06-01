import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const oneTrustHandler: BannerHandler = {
  name: 'One Trust',
  url: 'cdn.cookielaw.org/scripttemplates/otSDKStub.js',
  variants: [
    {
      name: 'Main Variant',
      check: async (page: Page) => {
        page;
        return true;
      },
      accept: async (page: Page) => {
        await page.locator('button#onetrust-accept-btn-handler').click();
      },
      reject: async (page: Page) => {
        await page.waitForTimeout(2000);
        const dontEnableBtn =  !!(await page.locator('button#onetrust-reject-all-handler').isVisible());
        const rejectBtn =  !!(await page.locator('button#cookie-disclosure-reject').isVisible());
        if(dontEnableBtn){
          await page.locator('button#onetrust-reject-all-handler').click();
        }
        else if(rejectBtn){
          await page.locator('button#cookie-disclosure-reject').click();
        }
        else {
          await page.locator('button#onetrust-pc-btn-handler').click();
          await page.waitForTimeout(1000);
          const refuseAllBtn = !!(await page.locator('button.ot-pc-refuse-all-handler').isVisible());
          const rejectAllBtn = !!(await page.locator('button.ot-pc-reject-all-handler').isVisible()); 
          if(refuseAllBtn){
            await page.locator('button.ot-pc-refuse-all-handler').click();
          }
          else if(rejectAllBtn){
            await page.locator('button.ot-pc-reject-all-handler').click();
          }
          else{
            await page.locator('button.save-preference-btn-handler').click();
          }
        }
        console.log('Rejected Succesfully.');
      }
    }
  ]
}