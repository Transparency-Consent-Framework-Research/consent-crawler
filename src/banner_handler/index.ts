// import cmps
import { Page } from 'playwright';

import { importHandlers } from './importer.js';

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

export const handlers: BannerHandler[] = await importHandlers();
console.log(`Initialized ${handlers.length} Handlers`);

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