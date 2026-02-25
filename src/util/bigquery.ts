import { BigQuery } from '@google-cloud/bigquery';
import { Cookie } from 'playwright';
import { CrawlData } from '../main.js';
import { ScanData } from '../scan.js';
import dayjs from 'dayjs';
import util from 'util';

// premium pubs table
// re-upload strings
// boolean strings table
// do both string libraries

const bigquery = new BigQuery({
  projectId: 'tcf-research-data',
  keyFilename: './gcp-keys.json',
});

export const save_to_bigquery = async (dataset: string, table: string, data: Record<string, unknown> | Record<string, unknown>[]) => {
  try {
    await bigquery.dataset(dataset).table(table).insert(data);
  } catch(error) {
    console.log(util.inspect(error, {showHidden: false, depth: null, colors: true}));
  }
}

export const save_crawl = async (data: CrawlData) => {

  console.log('timestamp', data.consent_action_timestamp);
  const crawls_table_data = {
    session_id: data.session_id,
    target_url: data.target_url,
    crawl_ip: data.crawl_ip,
    crawl_geo: data.crawl_geo,
    consent_action: data.consent_action,
    consent_action_success: data.consent_action_success,
    consent_action_timestamp: data.consent_action_timestamp,
    cmp_banner_variant: data.cmp_banner_variant,
    // cmp_detected: data.cmp_detected,
    // cmp_name: data.cmp_name,
    timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    cmp_id: data.cmp_id,
    tcfapi_detected: data.tcfapi_detected,
    action_object: data.action_object
  };

  const requests: any = data.requests.map((request) => {
    return {
      session_id: data.session_id,
      target_url: data.target_url,
      url: request.url,
      method: request.method,
      is_navigation_request: request.is_navigation_request,
      resource_type: request.resource_type,
      all_headers: JSON.stringify(request.all_headers),
      post_data: request.post_data || null,
      redirected_from: request.redirected_from || null,
      redirect_chain: (request.redirect_chain && request.redirect_chain.length > 0) ? JSON.stringify(request.redirect_chain) : null
    };
  });

  const cookies = data.cookies.map((cookie: Cookie) => {
    return {
      session_id: data.session_id,
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain || null,
      path: cookie.path || null,
      expires: cookie.expires || null,
      http_only: `${cookie.httpOnly}` || null,
      secure: `${cookie.secure}` || null,
      same_site: `${cookie.sameSite}` || null,
    };
  });

  const insert_promises = [
    bigquery.dataset('v2p2').table('sessions').insert(crawls_table_data),
    bigquery.dataset('v2p2').table('requests').insert(requests),
  ];

  if(cookies.length > 0) {
    insert_promises.push(bigquery.dataset('v2p2').table('cookies').insert(cookies));
  }

  // if(data.parsed_strings.length > 0) {
  //   insert_promises.push(bigquery.dataset('v2p2').table('parsed_strings').insert(data.parsed_strings));
  // }

  if(data.parsed_strings_boolean.length > 0) {
    insert_promises.push(bigquery.dataset('v2p2').table('parsed_strings_boolean').insert(data.parsed_strings_boolean));
  }

  try {
    await Promise.all(insert_promises);
  } catch (error) {
    console.log('Error Inserting!');
    //@ts-ignore
    console.log(util.inspect(error, {showHidden: false, depth: null, colors: true}));
  }

}