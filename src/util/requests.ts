import { Request } from 'playwright';

export type FormattedRequest = {
  is_navigation_request: boolean;
  method: string;
  url: string;
  resource_type: string;
  all_headers: object;
  post_data?: string | null; 
  redirected_from?: string | null;
  redirected_to?: string | null;
  redirect_chain?: Function | string[];
}

const build_redirect_chain = (request: Request, chain: string[]): Function | string[] => {
  const new_chain = [...chain];
  const parent_request: Request | null = request.redirectedFrom() ?? null
  if(parent_request) {
    new_chain.push(parent_request.url());
    return build_redirect_chain(parent_request, new_chain);
  } else {
    return new_chain;
  }
};

export const make_formatted_request = async (request: Request): Promise<FormattedRequest> => {
  const redirect_chain = build_redirect_chain(request, []);
  const all_headers = await request.allHeaders();
  return {
    is_navigation_request: request.isNavigationRequest(),
    method: request.method(),
    url: request.url(),
    resource_type: request.resourceType(),
    all_headers: all_headers,
    post_data: request.postData(),
    redirected_from: request.redirectedFrom()?.url(),
    redirected_to:  request.redirectedTo()?.url(),
    redirect_chain: redirect_chain,
  }
}