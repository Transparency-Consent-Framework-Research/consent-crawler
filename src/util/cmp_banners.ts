import { Log } from 'crawlee';
import { Page } from 'playwright';

export const banners = [
  // https://www.bbcgoodfood.com/ (Loaded direct)
  // https://wallet-wax.info/
  // https://www.bleepingcomputer.com/
  {
    name: 'Quantcast - Centered Modal',
    url: 'quantcast.mgr.consensu.org',
    playbooks: {
      accept: async (page: Page, log: Log) => {
        log.info('Accepting Consent Banner');
        await page.locator('#qc-cmp2-container .qc-cmp-cleanslate .qc-cmp2-summary-buttons button:first-child').click();
      },
      reject: async (page: Page, log: Log) => {
        await page.locator('#qc-cmp2-container .qc-cmp-cleanslate .qc-cmp2-summary-buttons button[mode="secondary"]').click();
        await page.waitForTimeout(1000);
        const headerLinkCount = await page.locator('#qc-cmp2-container .qc-cmp-cleanslate .qc-cmp2-header-links').count();
        if(headerLinkCount > 0) {
          log.info('Header links variant');
          await page.locator('#qc-cmp2-container .qc-cmp-cleanslate .qc-cmp2-header-links button:first-child').click();
          await page.waitForTimeout(500);
          await page.locator('.qc-cmp2-buttons-desktop button[mode="primary"]').click();
        } else {
          log.info('Variant without header links');
          await page.locator('.qc-cmp2-buttons-desktop button[mode="secondary"]').click();
        }
        log.info('Rejected Succesfully');
      }
    }
  },
  // Variant 3
  // https://www.express.co.uk/
  // {
  //   name: 'Quantcast - Bottom Fixed Modal',
  //   url: 'quantcast.mgr.consensu.org/choice',
  //   // .qc-cmp-cleanslate.css-3qvc2u
  //   accept_selector: '#qc-cmp2-container .qc-cmp2-summary-buttons button:first-child'
  // },
  // https://us.as.com/
  {
    name: 'Didomi',
    url: 'sdk.privacy-center.org',
    accept_selector: 'button#didomi-notice-agree-button',
    playbooks: {
      accept: async (page: Page, log: Log) => {
        log.info('Accepting Consent Banner');
        await page.locator('#didomi-notice #didomi-notice-agree-button').click();
        page
      },
      reject: async (page: Page, log: Log) => {
        log.info('Rejecting Consent Banner');
        await page.locator('#didomi-notice #didomi-notice-learn-more-button').click();
        await page.waitForTimeout(1000);
        await page.locator('#didomi-consent-popup div.didomi-consent-popup-actions button:first-child').click();
        log.info('Rejected');
      },
    }
  },
  // https://www.purepeople.com/ - Has a paypwall if you reject!
  // {
  //   name: 'Didomi - Rare',
  //   url: 'sdk.privacy-center.org',
  //   accept_selector: 'button.didomi-button[onclick^="Didomi.setUserAgreeToAll"]',
  //   playbooks: {
  //     accept: async (page: Page, log: Log) => {
  //       log.info('Accepting Consent Banner');
  //       page
  //     },
  //     reject: async (page: Page, log: Log) => {
  //       log.info('Rejecting Consent Banner');
  //       page
  //     },
  //   }
  // },
  // http://eurogamer.net
  // 'http://msdmanuals.com
  {
    name: 'OneTrust - One Click',
    url: 'cdn.cookielaw.org/scripttemplates/otSDKStub.js',
    playbooks: {
      accept: async (page: Page, log: Log) => {
        log.info('Accepting Consent Banner');
        await page.locator('button#onetrust-accept-btn-handler').click();
      },
      reject: async (page: Page, log: Log) => {
        log.info('Rejecting Consent Banner');
        await page.locator('button#onetrust-pc-btn-handler').click();
        await page.waitForTimeout(1000);
        await page.locator('button.save-preference-btn-handler').click();
        log.info('Rejected Succesfully');
      },
    }
  },
  // https://www.az-online.de/ - Has a paywall if you reject!
  // {
  //   name: 'CMP - Bottom',
  //   url: 'cdn.opencmp.net/tcf-v2/cmp-stub-latest.js',
  //   accept_selector: '.cmp_ui .cmp_mainButtons .cmp_button',
  //   playbooks: {
  //     accept: async (page: Page, log: Log) => {
  //       log.info('Accepting Consent Banner');
  //       page
  //     },
  //     reject: async (page: Page, log: Log) => {
  //       log.info('Rejecting Consent Banner');
  //       page
  //     },
  //   }
  // },
  // https://businessinsider.com.pl/
  {
    name: 'CMP - Popup',
    url: 'dl.cmp.min.js',
    accept_selector: 'button.cmp-intro_acceptAll',
    playbooks: {
      accept: async (page: Page, log: Log) => {
        log.info('Accepting Consent Banner');
        page
      },
      reject: async (page: Page, log: Log) => {
        log.info('Rejecting Consent Banner');
        await page.locator('.cmp-popup_popup .cmp-intro_options button.cmp-intro_rejectAll').click();
        await page.waitForTimeout(500);
        await page.locator('.cmp-popup_popup .cmp-details_footer button.cmp-intro_rejectAll').click();
        log.info('Rejected');
      },
    }
  },

  // https://www.forbes.com/
  // https://fortune.com/
  // https://www.flickr.com/ -> not working
  {
    name: 'CMP - Trustarc',
    url: 'consent.trustarc.com/notice',
    //accept_selector: 'a.saveAndExit',
    playbooks: {
      accept: async (page: Page, log: Log) => {
        log.info('Accepting Consent Banner');
        page
      },
      reject: async (page: Page, log: Log) => {
        log.info('Rejecting Consent Banner');
        await page.locator('button#truste-show-consent').click();
        await page.waitForTimeout(3000);
        const iframeP = page.frameLocator('.truste_box_overlay .truste_box_overlay_inner .truste_popframe');
        await iframeP.locator('.mainContent a.rejectAll').click();
        log.info('Rejected');
      },
    }
  },

  // https://www.civicuk.com/cookie-control/
  {
    name: 'CMP - civicUK',
    url: 'civicuk.com/cookie-control/',
    accept_selector: 'button#ccc-notify-accept',
    playbooks: {
      accept: async (page: Page, log: Log) => {
        log.info('Accepting Consent Banner');
        page
      },
      reject: async (page: Page, log: Log) => {
        log.info('Rejecting Consent Banner');
        await page.locator('button#ccc-notify-reject').click();
        log.info('Rejected');
      },
    }
  },

  // https://www.cookiebot.com/
  {
    name: 'CMP - cookieBot',
    url: 'cookiebot.com/',
    accept_selector: 'button#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection',
    playbooks: {
      accept: async (page: Page, log: Log) => {
        log.info('Accepting Consent Banner');
        page
      },
      reject: async (page: Page, log: Log) => {
        log.info('Rejecting Consent Banner');
        await page.locator('button#CybotCookiebotDialogBodyButtonDecline').click();
        log.info('Rejected');
      },
    }
  },
];