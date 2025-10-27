import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const sourcepointHandler:BannerHandler = {
  name: 'Sourcepoint Technologies, Inc.',
  url: 'https://sourcepoint.com/',
  cmpId: 6,
  variants: [
    {
      name: 'Has Reject All Button',
      check: async(page: Page) => {
        try{const iframe = page.frameLocator('iframe[title="SP Consent Message"]');
        return !!(await iframe.locator('button[title="Reject all"],button[title="Reject All"],button[title="Reject cookies"],button[title="No, I Do Not Accept"],button[title="No, thank you"],button[title="Essential cookies only"],button[title="Essential Cookies Only"],button[title="Essential only cookies"]').count());}
      catch (error){return false;}
      },
        accept: async (page: Page) => {
        const iframe = page.frameLocator('iframe[title="SP Consent Message"]');
        await iframe.locator('button[title="Accept all"],button[title="Accept All"],button[title="Accept cookies"],button[title="Yes, I Accept"],button[title="Yes, I accept"],button[title="Agree"]').click();
        page;
      },
      reject: async (page: Page) => {
        const iframe = page.frameLocator('iframe[title="SP Consent Message"]');
        await iframe.locator('button[title="Reject all"],button[title="Reject All"],button[title="Reject cookies"],button[title="No, I Do Not Accept"],button[title="No, thank you"],button[title="Essential cookies only"],button[title="Essential Cookies Only"],button[title="Essential only cookies"]').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
        name: 'Settings',
        check: async(page: Page) => {const iframe = page.frameLocator('iframe[title="SP Consent Message"]').first();
          return !!(await iframe.locator('button[title="MANAGE SETTINGS"],button[title="Manage Cookies"],button[title="OPTIONS"],button[title="More Options"],button[title="Instellingen"],button[title="Customise cookies"],button[title="Einstellungen"],button[title="Tilpass cookies"],button[title="Einstellungen oder ablehnen"]').count());},
        accept: async (page: Page) => {
          const iframe = page.frameLocator('iframe[title="SP Consent Message"]').first();
          await iframe.locator('button[title="Accept all"],button[title="Accept All"],button[title="Accept cookies"],button[title="Accept Cookies"],button[title="Yes, I Accept"],button[title="Yes, I accept"],button[title="AGREE"],button[title="Accept"],button[title="Accepteren"],button[title="YES, I AGREE"],button[title="Yes, I\'m happy"],button[title="Godta alle"],button[title="Alle akzeptieren"]').click();
          page;
        },
        reject: async (page) => {
                const iframe = page.frameLocator('iframe[title="SP Consent Message"]').first();
                await iframe.locator('button[title="MANAGE SETTINGS"],button[title="Manage Cookies"],button[title="OPTIONS"],button[title="More Options"],button[title="Instellingen"],button[title="Customise cookies"],button[title="Einstellungen"],button[title="Tilpass cookies"],button[title="Einstellungen oder ablehnen"]').click();
                await page.waitForTimeout(3000);
                const iframeM = page.frameLocator('iframe[title="SP Consent Message"], iframe[title="SP Toestemmingsbericht"],iframe[title="Iframe title"]').nth(1);
                try {
                    await iframeM.locator('button[title="REJECT ALL"],button[title="Reject All"],button[title="Reject all"],button[title="Reject"],button[title="Weigeren"],button[title="Withdraw Consent"],button[title="Einwilligung für alle widerrufen"],button[title="Alle ablehnen"],button[title="Avvis alle"]').first().click();
                }
                catch (error) {
                    await iframeM.locator('button[title="REJECT ALL"],button[title="Reject All"],button[title="Reject all"],button[title="Reject"]').nth(1).click();
                }
                console.log('Rejected Succesfully.');
            }
      },
    {
        name: 'Two sets of buttons',
        check: async(page: Page) => {const iframe = page.frameLocator('iframe[title="SP Consent Message"]');
          return !!(await iframe.locator('div.message-component.message-row.buttons-mobile').count());},
        accept: async (page: Page) => {
          const iframe = page.frameLocator('iframe[title="SP Consent Message"]');
          await iframe.locator('div.message-component.message-row.buttons-mobile button[title="Accept all"],button[title="Accept All"],button[title="Accept cookies"],button[title="Yes, I Accept"],button[title="Yes, I accept"]').click();
          page;
        },
        reject: async (page: Page) => {
          const iframe = page.frameLocator('iframe[title="SP Consent Message"]');
          await iframe.locator('div.message-component.message-row.buttons-desktop button.message-component.message-button.no-children.focusable.cmp-cta-reject.sp_choice_type_SE').click();
          console.log('Rejected Succesfully.');
        }
      }
  ]
}