import { getAuthenticatedHttpClient, getSiteConfig, getUrlByRouteRole } from '@openedx/frontend-base';
import * as QueryString from 'query-string';

export async function loginRequest(creds) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    isPublic: true,
  };

  const { data } = await getAuthenticatedHttpClient()
    .post(
      `${getSiteConfig().lmsBaseUrl}/api/user/v2/account/login_session/`,
      QueryString.stringify(creds),
      requestConfig,
    )
    .catch((e) => {
      throw (e);
    });

  const defaultRedirectUrl = getUrlByRouteRole('org.openedx.frontend.role.dashboard');
  const redirectUrl = data.redirect_url ?? defaultRedirectUrl;

  return {
    redirectUrl,
    success: data.success ?? false,
  };
}
