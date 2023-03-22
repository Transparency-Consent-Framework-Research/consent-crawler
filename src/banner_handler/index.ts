// import cmps
import { Page } from 'playwright';
import { Log } from 'crawlee';

import { quantcastHandler } from './cmps/quantcast.js';
import { civicHandler } from './cmps/civicuk.js';
import { cmpHandler } from './cmps/cmp.js';
import { cookiebotHandler } from './cmps/cookiebot.js';
import { didomiHandler } from './cmps/didomi.js';
import { oneTrustHandler } from './cmps/onetrust.js';
import { trustArcHandler } from './cmps/trustarc.js';
import { shinyStatHandler } from './cmps/shinystat.js';
import { sibboHandler } from './cmps/sibbo.js';
import { shareThisHandler } from './cmps/sharethis.js';
import { oguryHandler } from './cmps/ogury.js';
import { gmbhHandler } from './cmps/gmbh.js';
import { cookieInfoHandler } from './cmps/cookieinformation.js';
import { transfonHandler } from './cmps/transfon.js';

export type BannerHandler = {
  name: string;
  url: string;
  preActionHook?: (page: Page) => Promise<void>;
  variants: Array<
    {
      name: string;
      check: (page: Page) => Promise<boolean>;
      accept: (page: Page) => Promise<void>;
      reject: (page: Page) => Promise<void>;
    }
  >
}

export type DetectResult = {
  match: boolean;
  handler: BannerHandler | null;
}

export const detector = (log: Log) => {

  log.info('Initialized Banner Handler')

  const handlers = [
    quantcastHandler,
    civicHandler,
    cmpHandler,
    cookiebotHandler,
    didomiHandler,
    oneTrustHandler,
    trustArcHandler,
    shinyStatHandler,
    sibboHandler,
    shareThisHandler,
    oguryHandler,
    gmbhHandler,
    cookieInfoHandler,
    transfonHandler,
  ];

  const detectCmp = (url :string): DetectResult => {
    for (const handler of handlers) {
      if(url.includes(handler.url)) {
        return {
          match: true,
          handler: handler,
        }
      }
    }
    return {
      match: false,
      handler: null,
    }
  };

  return {
    handlers,
    detectCmp
  }
}

export const bannerHandler = async (page: Page, handler: BannerHandler, action: 'accept' | 'reject' = 'reject') => {

  if(typeof handler.preActionHook === 'function') {
    await handler.preActionHook(page);
    await page.waitForTimeout(2000);
  }

  const actionResult: any = {
    variant_name: 'none',
    success: false,
  }

  for (const variant of handler.variants) {
    const check = await variant.check(page);
    if(check === true) {
      console.log(`Detected variant: ${variant.name}`);
      actionResult.variant_name = variant.name;
      try {
        await variant[action](page);
        console.log('Variant action complete');
        actionResult.success = true;
      } catch(e) {
        if(e instanceof Error) {
          console.log('Variant action error', e.message);
        }
      }
      return actionResult;
    }
  }
  console.log('No variant action performed.');
  return {
    success: false
  };
}