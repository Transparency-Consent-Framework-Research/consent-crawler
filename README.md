# Consent Crawler
![GitHub issues](https://img.shields.io/github/issues/Transparency-Consent-Framework-Research/consent-crawler) ![GitHub](https://img.shields.io/github/license/Transparency-Consent-Framework-Research/consent-crawler)

## Introduction
Playwright based crawler designed to collect network telemetry and cookies by interacting with GDPR / TCF consent banners on publisher websites. Used to collect data as part of an academic research project into the adoption and quality of the Trust & Consent Framework put forth by the Internet Advertising Bureau (IAB).

The project includes a list of the top 100,000 domains, this list is used to generate the default list of domains to crawl. The list can be any single column CSV list, make_target_list splits the string by line into an array domains.

## Installation 
Recommended NodeJS Version: 20.x 

- [Ubuntu Install Guide](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04)
- [OSX Homebrew Install ](https://formulae.brew.sh/formula/node@20)

Before proceeding, ensure you have Node 20.x installed by running 
```
node -v
# Output should look lik ethis
# v20.15.1
```

After entering the directory for the project, install the project dependencies
```
npm install
```
Install the [playwright system dependencies](https://playwright.dev/docs/cli#install-system-dependencies) and respective browsers.
```
npx playwright install-deps
```

## Usage
Most settings you'll need can be controlled from the `constants.ts` file. When first setting up, copy the contents of `example.constants.ts` into a new file and configuring according to your needs, the defaults are a good place to start.

Run in development mode
```
npm run dev
```

Build the project
```
npm run build
```

Run the crawler in headless mode

Set `HEADLESS` to true in constants.ts, then run:
```
npm run start:prod
```

Run the crawler in headfull mode

Set `HEADLESS` to false in constants.ts, then run:
```
xvfb-run --auto-servernum node dist/main.js
```
The crawler is in `headless` mode by default. That means no UI will show when you run it. (In Ubuntu) To run it in headfull mode you can set `HEADLESS` to false in `constants.ts`, you must launch the crawler using [Xvfb](https://en.wikipedia.org/wiki/Xvfb).

## Runtime
The crawler will log as it crawls. It will log if and when it detects a CMP, if a variant check passes, and if a variant action succeeds. Additionally, it will log the values of the `__tcfapi` listener on page. [Read about the TCF Api listener events here](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#addeventlistener). This is important and will be used to determine if an action was successful . 


## Adding Support for a new CMP
The crawler auto loads all of the CMP "handlers" at launch from the `src/bannder_handler/cmps` directory. 

This is the anatomy of a handler
```js
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
``` 

To create a new handler, export an object with this structure from a new file inside of `cmps/`. The name of the export or the file don't matter, try to use descriptive names for each CMP.

This is a breakdown of each value in a handler:

### CMP Attributes

- **name**: Descriptive name of the CMP, can be anything.
- **url**: `(deprecated)` URL used to detect the CMP being loaded during crawls. No longer in use.
- **cmpId**: This is the ID of the CMP according to the IAB's CMP list. [The list can be found here](https://iabeurope.eu/cmp-list/).
- **preActionHook** `(deprecated)` No longer in use and will be removed soon.

### Variants
A variant in our case is a specific permutation of any CMP banner. Many CMPs have more than one banner style (One click consent decline, many clicks, buttons in different places, etc). 

The crawler detects a CMP by the cmpId it detects, then it loads the handler for that CMP and iterates over the variants, first running `check` to determine if the banner for it's variant is visible, if the `check` returns true, then it will perform the given specific action `accept` or `reject`. In our case the crawler is configured to `reject` by default.

- **check**: Simple function that is passed the playwright page. The goal is to determine which banner is visible by finding unique enough elements and writing selector checks for them. It's a callback, so it is ok if you need to write more than one check per banner, the logic can be as complex as needed.
- **reject**: Once a check passes, the reject action will attempt to click the banner and decline consent. It should consist of Playwright calls like clicks to the page. See existing handlers for examples.


## Saving Crawl Data
Data is uploaded to our public BigQuery dataset after each crawl automatically. Saving is disabled by default and should stay disabled during dev.

## Contributing
Please report issues on the GitHub issue tracker. Pull requests welcome!

## License
Distributed under the MIT License