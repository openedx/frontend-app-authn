import { getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';
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

  return {
    redirectUrl: data.redirect_url || `${getSiteConfig().lmsBaseUrl}/dashboard`,
    success: data.success || false,
  };
}
