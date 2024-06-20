// import cmps
import { Page } from 'playwright';
import { Log } from 'crawlee';

import { quantcastHandler } from './cmps/quantcast.js';
import { civicHandler } from './cmps/civicuk.js';
import { cmpHandler } from './cmps/cmp.js';
import { cookiebotHandler } from './cmps/cookiebot.js';
import { didomiHandler } from './cmps/didomi.js';
import { inmobiHandler } from './cmps/inmobi.js';
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
  cmpId: number;
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

export const handlers: BannerHandler[] = [
  // automatticHandler,
  quantcastHandler,
  civicHandler,
  cmpHandler,
  cookiebotHandler,
  // complianzBv,
  didomiHandler,
  // ezoicHandler,
  inmobiHandler,
  oneTrustHandler,
  trustArcHandler,
  shinyStatHandler,
  sibboHandler,
  shareThisHandler,
  // liveRampHandler,
  // mediavineHandler,
  oguryHandler,
  gmbhHandler,
  cookieInfoHandler,
  transfonHandler,
  // iubendaHandler,
  // sourcepointHandler,
  // sidataHandler,
  // appConsentHandler,
  // userCentricsHandler,
];

const handlersMap = new Map<number, BannerHandler>();

for (const handler of handlers) {
  if(handler.cmpId > 0) {
    handlersMap.set(handler.cmpId, handler);
  } else {
    console.warn(`Handler ${handler.name} has no cmpId, skipping.`);
  }
}

export const handleBanner = async (cmpId: number, page: Page, action: 'accept' | 'reject' = 'reject', log: any) => {
  log.info(`Handling Banner for ${cmpId} - ${action}`);
  const handler = handlersMap.get(cmpId);
  if(!handler) {
    return {
      variant_name: 'No CMP handler found',
      success: false
    }
  }

  if(typeof handler.preActionHook === 'function') {
    await handler.preActionHook(page);
    await page.waitForTimeout(2000);
  }

  const actionResult: any = {
    variant_name: 'Unknown variant',
    success: false,
  }

  log.info(`Checking for ${handler.name} variants. ${handler.variants.length} variants.`)
  for (const variant of handler.variants) {
    const check = await variant.check(page);
    log.info(`Variant ${variant.name} check: ${check}`)
    if(check === true) {
      log.info(`Detected variant: ${variant.name}`);
      actionResult.variant_name = variant.name;
      try {
        await variant[action](page);
        log.info('✅ Variant action complete');
        actionResult.success = true;
      } catch(e) {
        if(e instanceof Error) {
          console.log('🔴 Variant action error', e.message);
        }
      }

      if(actionResult.success === true) {
        return actionResult;
      }
      log.info(`❌ Variant action failed, trying next variant available.`);
    }
  }

  return {
    match: false,
    handler: null,
  }
}