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
  // https://www.flickr.com/ -> not working (reject not called)
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

  //https://www.eitb.eus/ -> not working (reject not called)
  //https://www.finect.com/
  //https://www.lasexta.com/
  {
    name: 'CMP - SIBBO',
    url: 'tv.sibbo.net/',
    playbooks: {
      accept: async (page: Page, log: Log) => {
        log.info('Accepting Consent Banner');
        await page.locator('a#acceptAllMain').click();
        page
      },
      reject: async (page: Page, log: Log) => {
        log.info('Rejecting Consent Banner');
        await page.locator('a#configCmpButtonMain').click();
        await page.waitForTimeout(1000);
        await page.locator('a#rejectAllConsent').click();
        log.info('Rejected');
      },
    }
  },

  //https://corp.evenium.com/us/
  //https://www.bohnendealer.coffee/ -> not working (reject not called)
  //https://cosedicasa.casa/ -> not working (variant)
  //https://www.sharethrough.com/
  {
    name: 'CMP - Transfon Ltd',
    url: 'cmp.uniconsent.com/',
    playbooks: {
      accept: async (page: Page, log: Log) => {
        log.info('Accepting Consent Banner');
        await page.locator('button#unic-agree').click();
        page
      },
      reject: async (page: Page, log: Log) => {
        log.info('Rejecting Consent Banner');
        await page.locator('div.unic div.unic-bar div.inner button.is-primary').click();
        await page.waitForTimeout(2000);
        await page.locator('div.unic-box div.modal-card section.modal-card-body button:not(.is-primary)').click();
        log.info('Rejected');
      },
    }
  },

  //http://zaubert.de/
  //https://www.deffenu.edu.it/
  //https://www.pentasoft.it/
  {
    name: 'CMP - ShinyStat',
    url: 'shinystat.com/',
    playbooks: {
      accept: async (page: Page, log: Log) => {
        log.info('Accepting Consent Banner');
        await page.locator('div[class^="div_shbnr_"] div[class^="innerdiv_shbnr_cs_"] button[class*="okBtn_shbnr_cs_"]').click();
        page
      },
      reject: async (page: Page, log: Log) => {
        log.info('Rejecting Consent Banner');
        await page.locator('div[class^="div_shbnr_"] div[class^="innerdiv_shbnr_cs_"] button[class*="koBtn_shbnr_cs_"]').click();
        log.info('Rejected');
      },
    }
  },

  //https://www.fightfear.us/
  //https://www.rimes.com/
  //http://hustleforhumanity.org/
  {
    name: 'CMP - ShareThis',
    url: 'sharethis.mgr.consensu.org/',
    playbooks: {
      accept: async (page: Page, log: Log) => {
        log.info('Accepting Consent Banner');
        await page.locator('div.st-cmp-permanent-footer-nav-buttons > div:nth-child(1)').click();
        page
      },
      reject: async (page: Page, log: Log) => {
        log.info('Rejecting Consent Banner');
        await page.locator('div.st-cmp-permanent-footer-nav-buttons > div:nth-child(2)').click();
        log.info('Rejected');
      },
    }
  },

  //https://ekilu.com/es
  //https://ogury.com/
  {
    name: 'CMP - Ogury',
    url: 'consent-manager-events.ogury.io/',
    playbooks: {
      accept: async (page: Page, log: Log) => {
        log.info('Accepting Consent Banner');
        const iframeP = page.frameLocator('.ogury-consent-manager__form__iframe');
        await iframeP.locator('div#root div.container div.flex > div:nth-child(3) button').click();
        page
      },
      reject: async (page: Page, log: Log) => {
        log.info('Rejecting Consent Banner');
        const iframeP = page.frameLocator('.ogury-consent-manager__form__iframe');
        await iframeP.locator('div#root div.container div.flex > div:nth-child(2) button').click();
        await page.waitForTimeout(2000);
        await iframeP.locator('div#root div.container div.flex > div:nth-child(2) button').click();
        log.info('Rejected');
      },
    }
  },

  //https://tasty-cat.net/
  //https://www.klatsch-tratsch.de/
  //https://www.wisst-ihr-noch.de/
  {
    name: 'CMP - Multimedia Internet Services GmbH',
    url: 'consentserve.mgr.consensu.org/',
    playbooks: {
      accept: async (page: Page, log: Log) => {
        log.info('Accepting Consent Banner');
        await page.locator('button#cmp_popup_boxAcceptAllButton').click();
        page
      },
      reject: async (page: Page, log: Log) => {
        log.info('Rejecting Consent Banner');
        await page.locator('a#cmp_popup_boxShowAllButton').click();
        await page.waitForTimeout(2000);
        await page.locator('button#cmp_popup_boxSaveChangesButton').click();
        log.info('Rejected');
      },
    }
  },


  //https://www.asiakastieto.fi/web/fi/
  //https://videnskab.dk/
  //https://borsenfordelsklub.dk/
  {
    name: 'CMP - Cookie Information APS',
    url: 'cookieinformation.mgr.consensu.org/',
    playbooks: {
      accept: async (page: Page, log: Log) => {
        log.info('Accepting Consent Banner');
        await page.locator('div#coi-tcf-modal-main div.coi-tcf-modal__overlay div.coi-tcf-modal__footer button#acceptButton').click();
        page
      },
      reject: async (page: Page, log: Log) => {
        log.info('Rejecting Consent Banner');
        await page.locator('div#coi-tcf-modal-main div.coi-tcf-modal__overlay div.coi-tcf-modal__footer button.coi-tcf-modal__button[data-coi-action="reject_all"]').click();
        log.info('Rejected');
      },
    }
  },

  //https://zonait.ro/
  //https://protv.md/
  //https://www.portfolio.hu/
  {
    name: 'CMP - Gemius SA',
    url: 'gemius.mgr.consensu.org/',
    playbooks: {
      accept: async (page: Page, log: Log) => {
        log.info('Accepting Consent Banner');
        const iframeP = page.frameLocator('div#_ao-cmp-ui iframe');
        const divVariant1 = iframeP.locator('div.modal div.footer-dialog');
        const divVariant2 = iframeP.locator('div.modal div.modal-dialog');
        if(await divVariant1.count() > 0) {
          divVariant1.locator('div.modal-content div.main-controls button.btn-success').click();
        }
        else if(await divVariant2.count() > 0) {
          divVariant2.locator('div.modal-content div.modal-footer div.btn-group button.btn-success').click();
        }
        page
      },
      reject: async (page: Page, log: Log) => {
        log.info('Rejecting Consent Banner');
        const iframeP = page.frameLocator('div#_ao-cmp-ui iframe');
        const divVariant1 = iframeP.locator('div.modal div.footer-dialog');
        const divVariant2 = iframeP.locator('div.modal div.modal-dialog');

        if(await divVariant1.count() > 0) {
          divVariant1.locator('div.modal-content div.main-controls button.btn-secondary');
          await page.waitForTimeout(2000);
          divVariant1.locator('div.modal-content div.main-controls button.btn-success').click();
        }
        else if(await divVariant2.count() > 0) {
          divVariant2.locator('div.modal-content div.modal-footer div.btn-group button.btn-secondary');
          await page.waitForTimeout(2000);
          divVariant2.locator('div.modal-content div.modal-footer div.btn-group button.btn-success').click();
        }

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