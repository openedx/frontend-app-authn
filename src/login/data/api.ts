import { camelCaseObject, getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';
import * as QueryString from 'query-string';

import { normalizeRedirectUrl } from '../../data/utils';

const login = async (creds) => {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    isPublic: true,
  };
  const url = `${getSiteConfig().lmsBaseUrl}/api/user/v2/account/login_session/`;
  const { data } = await getAuthenticatedHttpClient()
    .post(url, QueryString.stringify(creds), requestConfig);
  return camelCaseObject({
    redirectUrl: normalizeRedirectUrl(data.redirect_url || ''),
    success: data.success || false,
  });
};

export {
  login,
};
