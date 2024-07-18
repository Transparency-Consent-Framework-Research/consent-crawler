import { Cookie  } from 'playwright';
import { FormattedRequest } from '../util/requests.js';

export type CrawlData = {
  session_id: string;
  target_url: string;
  tcfapi_detected: boolean;
  cmp_detected: boolean;
  cmp_id?: number;
  cmp_name?: string;
  cmp_banner_variant?: string;
  consent_action: "ACCEPT" | "REJECT" | "NONE";
  consent_action_success?: boolean;
  consent_action_timestamp: string;
  crawl_geo: string,
  crawl_ip: string,
  requests: FormattedRequest[],
  cookies: Cookie[],
  parsed_strings?: any,
  parsed_strings_boolean?: any,
  action_object?: string,
}