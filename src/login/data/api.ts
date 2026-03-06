import { camelCaseObject, getAuthenticatedHttpClient, getSiteConfig, getUrlByRouteRole } from '@openedx/frontend-base';
import * as QueryString from 'query-string';

const login = async (creds) => {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    isPublic: true,
  };
  const url = `${getSiteConfig().lmsBaseUrl}/api/user/v2/account/login_session/`;
  const { data } = await getAuthenticatedHttpClient()
    .post(url, QueryString.stringify(creds), requestConfig);
  const defaultRedirectUrl = getUrlByRouteRole('org.openedx.frontend.role.dashboard');
  return camelCaseObject({
    redirectUrl: data.redirect_url || defaultRedirectUrl,
    success: data.success || false,
  });
};

export {
  login,
};
