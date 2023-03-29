import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const cookiebotHandler: BannerHandler = {
  name: 'CookieBot',
  url: 'cookiebot.com',
  variants: [
    {
      name: 'Variant - Selection - CheckBox',
      check: async(page: Page) => !!(await page.locator('#CybotCookiebotDialogBodyLevelButtonsSelectPane').isVisible()),
      accept: async (page: Page) => {
        const acceptBtnType1 = !!(await page.locator('#CybotCookiebotDialogBodyLevelButtonAccept').isVisible());
        if(acceptBtnType1){
          await page.locator('#CybotCookiebotDialogBodyLevelButtonAccept').click();
        }
        else{
          await page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').click();
        }
        page;
      },
      reject: async (page: Page) => {
        await page.locator('#CybotCookiebotDialogBodyLevelButtonPreferences').uncheck();
        await page.locator('#CybotCookiebotDialogBodyLevelButtonStatistics').uncheck();
        await page.locator('#CybotCookiebotDialogBodyLevelButtonMarketing').uncheck();
        const declineBtn = !!(await page.locator('#CybotCookiebotDialogBodyButtonDecline').isVisible());
        const acceptBtnType1 = !!(await page.locator('#CybotCookiebotDialogBodyLevelButtonAccept').isVisible());
        if(declineBtn){
          await page.locator('#CybotCookiebotDialogBodyButtonDecline').click();
        }
        else if(acceptBtnType1){
          await page.locator('#CybotCookiebotDialogBodyLevelButtonAccept').click();
        }
        else{
          await page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection').click();
        }
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant - Deny Selection - CheckBox',
      check: async(page: Page) => !!(await page.locator('#CybotCookiebotDialogBodyButtonDetails').isVisible() && 
      await page.locator('#CybotCookiebotDialogBodyButtonDecline').isVisible() ),
      accept: async (page: Page) => {
        const acceptBtnType1 = !!(await page.locator('#CybotCookiebotDialogBodyLevelButtonAccept').isVisible());
        if(acceptBtnType1){
          await page.locator('#CybotCookiebotDialogBodyLevelButtonAccept').click();
        }
        else{
          await page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').click();
        }
        page;
      },
      reject: async (page: Page) => {
        await page.locator('#CybotCookiebotDialogBodyButtonDecline').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant - More - Only Accept',
      check: async (page: Page) => {
        const moreBtn =  !!(await page.locator('#CybotCookiebotDialogBodyButtonDetails').isVisible())
        if(moreBtn){
          await page.locator('#CybotCookiebotDialogBodyButtonDetails').click();
          await page.waitForTimeout(500);
          const checkBoxVisible = !!await page.locator('#CybotCookiebotDialogBodyLevelButtonPreferences').isVisible();
          return !checkBoxVisible;
        }
        return false;
      },
      accept: async (page: Page) => {
        const acceptBtnType1 = !!(await page.locator('#CybotCookiebotDialogBodyLevelButtonAccept').isVisible());
        if(acceptBtnType1){
          await page.locator('#CybotCookiebotDialogBodyLevelButtonAccept').click();
        }
        else{
          await page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').click();
        }
        page;
      },
      reject: async (_page: Page) => {
        console.log('No Reject Button');
      }
    },
    {
      name: 'Variant - More - Selection - CheckBox',
      check: async(page: Page) => !!(await page.locator('#CybotCookiebotDialogBodyButtonDetails').isVisible()),
      accept: async (page: Page) => {
        const acceptBtnType1 = !!(await page.locator('#CybotCookiebotDialogBodyLevelButtonAccept').isVisible());
        const acceptBtnType2 = !!(await page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').isVisible());
        if(acceptBtnType1){
          await page.locator('#CybotCookiebotDialogBodyLevelButtonAccept').click();
        }
        else{
          await page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').click();
        }
        page;
      },
      reject: async (page: Page) => {
        //await page.locator('#CybotCookiebotDialogBodyButtonDetails').click();
        //await page.waitForTimeout(500);
        await page.locator('#CybotCookiebotDialogBodyLevelButtonPreferences').uncheck();
        await page.locator('#CybotCookiebotDialogBodyLevelButtonStatistics').uncheck();
        await page.locator('#CybotCookiebotDialogBodyLevelButtonMarketing').uncheck();
        const declineBtn = !!(await page.locator('#CybotCookiebotDialogBodyLevelButtonDecline').isVisible());
        const acceptBtnType1 = !!(await page.locator('#CybotCookiebotDialogBodyLevelButtonAccept').isVisible());
        const acceptBtnType2 = !!(await page.locator('#CybotCookiebotDialogBodyButtonAccept').isVisible());
        if(declineBtn){
          await page.locator('#CybotCookiebotDialogBodyLevelButtonDecline').click();
        }
        else if(acceptBtnType1){
          await page.locator('#CybotCookiebotDialogBodyLevelButtonAccept').click();
        }
        else if(acceptBtnType2){
          await page.locator('#CybotCookiebotDialogBodyButtonAccept').click();
        }
        else{
          await page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').click();
        }
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant 3',
      check: async(page: Page) => !!(await page.locator('#manage-cookies').isVisible()),
      accept: async (page: Page) => {
        await page.locator('div#cookiebanner div#c-right a.c-button').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('#manage-cookies').click();
        await page.waitForTimeout(500);
        await page.locator('div#settings-content div.button-container a.c-button').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant - 4',
      check: async(page: Page) => !!(await page.locator('#cookiewrapper').isVisible()),
      accept: async (page: Page) => {
        await page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('#CybotCookiebotDialogBodyLevelButtonAccept').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant - Selection - PopUp - Switch',
      check: async(page: Page) => !!(await page.locator('#CybotCookiebotDialogFooter').isVisible()),
      accept: async (page: Page) => {
        await page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection').click();
        page;
      },
      reject: async (page: Page) => {
        const declineBodyBtn = !!(await page.locator('#CybotCookiebotDialogBodyButtonDecline').isVisible());
        if(declineBodyBtn){
          await page.locator('#CybotCookiebotDialogBodyButtonDecline').click();
        }
        else{
          await page.locator('#CybotCookiebotDialogBodyLevelButtonCustomize').click();
          await page.waitForTimeout(500);
          await page.locator('#CybotCookiebotDialogBodyLevelButtonPreferencesInline').uncheck();
          await page.locator('#CybotCookiebotDialogBodyLevelButtonStatisticsInline').uncheck();
          await page.locator('#CybotCookiebotDialogBodyLevelButtonMarketingInline').uncheck();
          await page.locator('#CybotCookiebotDialogBodyButtonDecline').click();
        }
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant - Selection - PopUp - CheckBox',
      check: async(page: Page) => !!(await page.locator('#CybotCookiebotDialogBody').isVisible()),
      accept: async (page: Page) => {
        await page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').click();
        page;
      },
      reject: async (page: Page) => {
        const declineAllBodyBtn = !!(await page.locator('div#CybotCookiebotDialogBodyButtons #CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll').isVisible());
        const declineAllBodyLevelBtn = !!(await page.locator('div#CybotCookiebotDialogBodyLevelWrapper #CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll').isVisible());
        const declineBodyBtn = !!(await page.locator('div#CybotCookiebotDialogBodyButtons #CybotCookiebotDialogBodyButtonDecline').isVisible());
        const declineBodyLevelBtn = !!(await page.locator('div#CybotCookiebotDialogBodyLevelWrapper #CybotCookiebotDialogBodyButtonDecline').isVisible());
        const allowSelectionBodyLevelBtn = !!(await page.locator('div#CybotCookiebotDialogBodyLevelWrapper #CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection').isVisible());
        const allowSelectionBodyBtn = !!(await page.locator('div#CybotCookiebotDialogBodyButtons #CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection').isVisible());
        if(declineAllBodyBtn) {
          await page.locator('div#CybotCookiebotDialogBodyButtons #CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll').click();
        }
        else if(declineAllBodyLevelBtn) {
          await page.locator('div#CybotCookiebotDialogBodyLevelWrapper #CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll').click();
        }
        else if(declineBodyBtn) {
          await page.locator('div#CybotCookiebotDialogBodyButtons #CybotCookiebotDialogBodyButtonDecline').click();
        }
        else if(declineBodyLevelBtn) {
          await page.locator('div#CybotCookiebotDialogBodyLevelWrapper #CybotCookiebotDialogBodyButtonDecline').click();
        }
        else if(allowSelectionBodyBtn){
          await page.locator('div#CybotCookiebotDialogBodyButtons #CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection').click();
        }
        else if(allowSelectionBodyLevelBtn) {
          await page.locator('div#CybotCookiebotDialogBodyLevelWrapper #CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection').click();
        }
        else {
          await page.locator('div#CybotCookiebotDialogBodyLevelWrapper #CybotCookiebotDialogBodyLevelDetailsButton').click();
          await page.waitForTimeout(500);
          await page.locator('#CybotCookiebotDialogBodyLevelButtonPreferences').uncheck();
          await page.locator('#CybotCookiebotDialogBodyLevelButtonStatistics').uncheck();
          await page.locator('#CybotCookiebotDialogBodyLevelButtonMarketing').uncheck();
          await page.locator('div#CybotCookiebotDialogBodyLevelDetailsWrapper #CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection').click();
          
        }
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant 7',
      check: async(page: Page) => !!(await page.locator('#CybotCookiebotDialogBodyLevelWrapper').isVisible() 
      && page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll').isVisible()),
      accept: async (page: Page) => {
        await page.locator('div#CybotCookiebotDialogBodyLevelWrapper #CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('div#CybotCookiebotDialogBodyLevelWrapper #CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant 8',
      check: async(page: Page) => !!(await page.locator('#CybotCookiebotDialogBodyLevelWrapper').isVisible() 
      && page.locator('#CybotCookiebotDialogBodyLevelDetailsButton').isVisible()),
      accept: async (page: Page) => {
        await page.locator('div#CybotCookiebotDialogBodyLevelWrapper #CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('div#CybotCookiebotDialogBodyLevelWrapper #CybotCookiebotDialogBodyLevelDetailsButton').click();
        await page.waitForTimeout(500);
        await page.locator('#CybotCookiebotDialogBodyLevelButtonPreferences').uncheck();
        await page.locator('#CybotCookiebotDialogBodyLevelButtonStatistics').uncheck();
        await page.locator('#CybotCookiebotDialogBodyLevelButtonMarketing').uncheck();
        await page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant 9',
      check: async(page: Page) => !!(await page.locator('#CookiebotCustom').isVisible()),
      accept: async (page: Page) => {
        await page.locator('div#CookiebotCustom #CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('div#CookiebotCustom #CybotCookiebotDialogBodyButtonDecline').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant 10',
      check: async(page: Page) => !!(await page.locator('#cookiesck').isVisible()),
      accept: async (page: Page) => {
        await page.locator('#cookiesck_accept').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('#cookiesck_decline').click();
        console.log('Rejected Succesfully.');
      }
    }
  ]
}