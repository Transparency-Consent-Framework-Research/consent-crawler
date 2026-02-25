import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const appconsentHandler:BannerHandler = {
  name: 'AppConsent SFBX',
  url: 'https://app.appconsent.io/',
  cmpId: 2,
  variants: [
    {
      name: 'iframe-Banner Variant',
      check: async (page: Page) => {
        try {
          const iframe = page.frameLocator('iframe[srcdoc*="<div class=\\"frame-root\\"></div>"]');
          return !!(await iframe.locator('div.sc-sq9wn4-0.cDeLfA.banner.banner--modal').count());
        } catch (error) {
          console.log('Error in iframe-Banner Variant check:', error);
          return false;
        }
      },
      accept: async (page: Page) => {
          const iframe = page.frameLocator('iframe[srcdoc*="<div class=\\"frame-root\\"></div>"]');
          await iframe.locator('aside.sc-f7uhhq-0.hbqfXb.controlArea.banner__controlArea button.sc-1epc5np-0.daSnA.sc-f7uhhq-2.coEmEP.button.button--filled.button__acceptAll').click();
          page;
      },
      reject: async (page: Page) => {
          const iframe = page.frameLocator('iframe[srcdoc*="<div class=\\"frame-root\\"></div>"]');
          await iframe.locator('aside[class*="banner__controlArea"] button[class*="button__openPrivacyCenter"]').click();
          await page.waitForTimeout(1000);
          const iframeR = page.frameLocator('iframe[srcdoc*="<div class=\\"frame-root\\"></div>"]');
          await iframeR.locator('section.sc-4sw17b-1.hvuRMQ >a').nth(0).click();
          await iframeR.locator('section.sc-we3acd-5.hyMEnJ button[class*="button__acceptAll"]').click();
          console.log('Rejected Succesfully.');
      }
    },
    {
        name: 'iframe-Consent Window',
        check: async (page: Page) => {
            try {
              const iframe = page.frameLocator('iframe[title="Consent window"]');
              return !!(await iframe.locator('div.sc-jRQBWg.kLfOIr.banner__buttons.main-page__buttons button.sc-iCfMLu.bSSzHR.button.button--filled.button__refuseAll').count());
            } catch (error) {
              console.log('Error in iframe-Consent Window check:', error);
              return false;
            }
          },
        accept: async (page: Page) => {
            const iframe = page.frameLocator('iframe[title="Consent window"]');
            await iframe.locator('div.sc-jRQBWg.kLfOIr.banner__buttons.main-page__buttons button.sc-furwcr.jhwOCG.button.button--filled.button__acceptAll').click();
            page;
        },
        reject: async (page: Page) => {
            const iframe = page.frameLocator('iframe[title="Consent window"]');
            await iframe.locator('div.sc-jRQBWg.kLfOIr.banner__buttons.main-page__buttons button.sc-iCfMLu.bSSzHR.button.button--filled.button__refuseAll').click();
            console.log('Rejected Succesfully.');
        }
      },
    {
        name: 'iframe-Consent Window-two windows',
        check: async (page: Page) => {
            try {
              const iframe = page.frameLocator('iframe[title="Consent window"]');
              return !!(await iframe.locator('div.sc-dPiLbb.hrFBBr.page__banner').count());
            } catch (error) {
              console.log('Error in iframe-Consent Window check:', error);
              return false;
            }
          },
        accept: async (page: Page) => {
            const iframe = page.frameLocator('iframe[title="Consent window"]');
            await iframe.locator('div.sc-jRQBWg.kLfOIr.banner__buttons.main-page__buttons >button').nth(1).click();
            page;
        },
        reject: async (page: Page) => {
            const iframe = page.frameLocator('iframe[title="Consent window"]');
            await iframe.locator('div[class*="banner__buttons"][class*="main-page__buttons"] > button').nth(0).click();
            await page.waitForTimeout(1000);
            const iframeR = page.frameLocator('iframe[title="Consent window"]');
            await iframeR.locator('div.sc-dtMgUX.jSjqPe.globalChoice__wrapper div.sc-fFeiMQ.gksSdD').click();
            await iframeR.locator('div.sc-cZMNgc.WQbxm.privacy__buttons button').click();
            console.log('Rejected Succesfully.');
        }
      }
  ]
}