# Consent Crawler
![GitHub issues](https://img.shields.io/github/issues/Transparency-Consent-Framework-Research/consent-crawler) ![GitHub](https://img.shields.io/github/license/Transparency-Consent-Framework-Research/consent-crawler)

## Introduction
This is the artifact README for the paper "A Study of GDPR Compliance under the Transparency and Consent Framework" published in the proceedings of the International World Wide Web Conference (WWW), 2024. In this paper, we reviewed 2,230 websites that use TCF and accepted the automatic decline of user consent by our crawler to evaluate if websites comply with TCF policies and how this affects user privacy. 

This repository contains the code for our Playwright based crawler designed to collect network telemetry and cookies by interacting with GDPR / TCF consent banners on publisher websites. The project includes a list of the top 100,000 domains, this list is used to generate the default list of domains to crawl. The list can be any single column CSV list, make_target_list splits the string by line into an array domains. Also included in the data folder are files containing the crawl data, cookie data, and decoded TC string data used in the analysis for our paper. 

## Installation 
- Recommended NodeJS Version: 18.x

After entering the directory for the project, install the project dependencies
```
npm install
```
Install the [playwright system dependencies](https://playwright.dev/docs/cli#install-system-dependencies) and respective browsers.
```
npx playwright install-deps
```

## Usage
If the crawler is running on headful mode (`launchOptions.headless = false`), you must launch the crawler using [Xvfb](https://en.wikipedia.org/wiki/Xvfb).

Build the project
```
npm run build
```
Run the crawler
```
xvfb-run --auto-servernum node dist/main.js
```

## Saving Crawl Data
The cralwer uses crawlee's [KeyValue](https://crawlee.dev/docs/guides/result-storage#key-value-store) storage mechanism.

`⚠ The default storage is purged on startup between sessions.`

To preserve data between runs, specify a store name during open.
```js
const store = await KeyValueStore.open('my-store-name');
```

Data will be stored in `/storage/key_value_stores/my-storage-name/`

## Contributing
Please report issues on the GitHub issue tracker. Pull requests welcome!


## License
Distributed under the MIT License
