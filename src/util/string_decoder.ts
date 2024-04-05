import { Cookie } from 'playwright';
import parse_string from 'tc-string-parse';
import { TCString } from '@iabtcf/core';
import { flatten } from 'wild-wild-utils';
import { CrawlData } from '../main.js';
import { FormattedRequest } from './requests.js';

const LOG_ERRORS = false;
const SAVE_DECODE_FAILURES = false;

// decodes a gdpr consent string and returns the decoded object 
// we are using the @iabtcf/core library to decode the string
// sets are being converted to arrays because sets are not valid json
function decode(string: string): any {
  // try to decode the string or throw an error
  const decoded = TCString.decode(string);

  // convert the decoded object to a new object where all the sets are converted to arrays
  const newDecoded: any = {};
  // these are the keys that are sets and need to be converted to arrays
  const setKeys = [
    "specialFeatureOptins",
    "purposeConsents",
    "purposeLegitimateInterests",
    "publisherConsents",
    "publisherLegitimateInterests",
    "publisherCustomConsents",
    "publisherCustomLegitimateInterests",
    "vendorConsents",
    "vendorLegitimateInterests",
    "vendorsDisclosed",
    "vendorsAllowed",
    // "publisherRestrictions",
  ]
  // loop through all the keys in the decoded object and convert the sets to arrays
  for(const value of Object.keys(decoded)) {
    if(setKeys.includes(value)) {
      // @ts-ignore
      newDecoded[value] = [...decoded[value]["set_"]];
    } else if (value === 'publisherRestrictions') {
      // newDecoded[value] = Object.fromEntries(decoded[value]["map"]);
      newDecoded[value] = {};
    } else {
      // @ts-ignore
      newDecoded[value] = decoded[value];
    }
  }
  return newDecoded;
}


// find gdpr strings in an object and return them in an array 
// we only want to look for strings that are 5 characters or longer
// and start with CO, CP, CL or have gdpr or gdpr_consent in the key
// all the parameters are arbitrary and can likely be improved. 
function findStrings(object: any): any {
  const strings: any = [];
  try {
    for(const [key, value] of Object.entries(object)) {
      if(
        typeof value === 'string' && 
        value.length > 5 &&
        (
          ( 
            key.includes('gdpr') || 
            key.includes('gdpr_consent')
          ) || 
          (
            value.startsWith('CO') || 
            value.startsWith('CP') || 
            value.startsWith('CL')
          )
        )
      ) {
        strings.push(value);
      }
    }
  } catch(e) {
    if(e instanceof Error) {
      console.log('failed findstrings', e.message);
    }
  }
  return strings;
}

function makeBlankRow() {
  return {
    purposeConsents_1: 0,
    purposeConsents_2: 0,
    purposeConsents_3: 0,
    purposeConsents_4: 0,
    purposeConsents_5: 0,
    purposeConsents_6: 0,
    purposeConsents_7: 0,
    purposeConsents_8: 0,
    purposeConsents_9: 0,
    purposeConsents_10: 0,

    purposeLegitimateInterests_1: 0,
    purposeLegitimateInterests_2: 0,
    purposeLegitimateInterests_3: 0,
    purposeLegitimateInterests_4: 0,
    purposeLegitimateInterests_5: 0,
    purposeLegitimateInterests_6: 0,
    purposeLegitimateInterests_7: 0,
    purposeLegitimateInterests_8: 0,
    purposeLegitimateInterests_9: 0,
    purposeLegitimateInterests_10: 0,

    publisherConsents_1: 0,
    publisherConsents_2: 0,
    publisherConsents_3: 0,
    publisherConsents_4: 0,
    publisherConsents_5: 0,
    publisherConsents_6: 0,
    publisherConsents_7: 0,
    publisherConsents_8: 0,
    publisherConsents_9: 0,
    publisherConsents_10: 0,
    publisherConsents_11: 0,
    publisherConsents_12: 0,
    publisherConsents_13: 0,
    publisherConsents_14: 0,
    publisherConsents_15: 0,
    publisherConsents_16: 0,
    publisherConsents_17: 0,
    publisherConsents_18: 0,
    publisherConsents_19: 0,
    publisherConsents_20: 0,
    publisherConsents_21: 0,
    publisherConsents_22: 0,
    publisherConsents_23: 0,

    publisherLegitimateInterests_1: 0,
    publisherLegitimateInterests_2: 0,
    publisherLegitimateInterests_3: 0,
    publisherLegitimateInterests_4: 0,
    publisherLegitimateInterests_5: 0,
    publisherLegitimateInterests_6: 0,
    publisherLegitimateInterests_7: 0,
    publisherLegitimateInterests_8: 0,
    publisherLegitimateInterests_9: 0,
    publisherLegitimateInterests_10: 0,
    publisherLegitimateInterests_11: 0,
    publisherLegitimateInterests_12: 0,
    publisherLegitimateInterests_13: 0,
    publisherLegitimateInterests_14: 0,
    publisherLegitimateInterests_15: 0,
    publisherLegitimateInterests_16: 0,
    publisherLegitimateInterests_17: 0,
    publisherLegitimateInterests_18: 0,
    publisherLegitimateInterests_19: 0,
    publisherLegitimateInterests_20: 0,
    publisherLegitimateInterests_21: 0,
    publisherLegitimateInterests_22: 0,
    publisherLegitimateInterests_23: 0,
    publisherLegitimateInterests_24: 0,
  }
}

export const find_and_decode = (session_id: string, requests: FormattedRequest[], cookies: Cookie[]): any => {

  const parsed_strings: any = [];

  // search through request query strings
  for(const request of requests) {
    try {
      // parse the url to get the search params, will throw an error if the url is invalid
      const url = new URL(request.url);
      // search params are the query string params in the url (e.g. ?foo=bar) 
      // we want to look for gdpr strings in these params
      const candidateStrings = findStrings(Object.fromEntries(url.searchParams));

      for(const string of candidateStrings) {
        try {
          // try to decode the string
          const decoded = decode(string);
          parsed_strings.push({
            session_id: session_id,
            string: string,
            decode_success: true,
            decoded_string: JSON.stringify(decoded),
            found_on: JSON.stringify(request),
          });
        } catch(e) {
          if(e instanceof Error && LOG_ERRORS) {
            console.log('failed to decode string', e.message);
          }
        }
      }

      if(request.method === 'POST' && request.post_data) {
        const body = JSON.parse(request.post_data);
        // flatten the post data object so we can easily search for gdpr strings
        const flattened = flatten(body);
        // find all the gdpr strings in the flattened post data
        const candidateStrings = findStrings(flattened);
        for(const string of candidateStrings) {
          try {
            // try to decode the string
            const decoded = decode(string);
            parsed_strings.push({
              session_id: session_id,
              string: string,
              decode_success: true,
              decoded_string: JSON.stringify(decoded),
              found_on: JSON.stringify(request),
            });
    
          } catch(e) {
            if(e instanceof Error && LOG_ERRORS) {
              console.log('failed to decode string', e.message);
            }
          }
        }
      }

        // look for gdpr strings in the cookies, the keys are a bit different than in requests and post data
        // given the structure and what we know about cookies, however we can still look for gdpr strings
        // by checking the beginning of the cookie name and value
        for(const cookie of cookies) {
          if((cookie.name.includes('consent') || cookie.name.includes('gdpr') || cookie.value.startsWith('CP') || cookie.value.startsWith('C0') || cookie.value.startsWith('CL') ) && cookie.value.length > 5) {
            try {
              // try to decode the string
              const decoded = decode(cookie.value);
              parsed_strings.push({
                session_id: session_id,
                string: cookie.value,
                decode_success: true,
                decoded_string: JSON.stringify(decoded),
                found_on: JSON.stringify(cookie),
              });
            } catch(e) {
              if(e instanceof Error && LOG_ERRORS) {
                console.log('failed to decode string', e.message);
              }
            }
          }
        }
    } catch(e) {}
  }

  console.log(`Found ${parsed_strings.length} gdpr strings in ${session_id}`);
  return parsed_strings;
};

export const make_boolean_rows = (parsed_strings: any[], session_id: string, target_url: string): any[] => {

  const rows: any = [];
  for(const string of parsed_strings) {
    const tc_string = string.string;
    const decoded = JSON.parse(string.decoded_string);
    const output_data = {
      session_id: session_id,
      target_url: target_url,
      tc_string: tc_string,
      ...makeBlankRow()
    }
    for(const cat of ["purposeConsents", "purposeLegitimateInterests", "publisherConsents", "publisherLegitimateInterests"]) {
      for(const value of decoded[cat]) {
        const column = `${cat}_${value}`;
        // @ts-ignore
        if(!output_data[column]) {
        // @ts-ignore
          output_data[column] = 1;
        }
      }
    }
    rows.push(output_data);
  }
  // if(rows.length > 0) {
  //   console.log(rows)
  // }
  return rows;
}