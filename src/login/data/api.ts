import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import * as QueryString from 'query-string';

const login = async (creds) => {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    isPublic: true,
  };
  const url = `${getConfig().LMS_BASE_URL}/api/user/v2/account/login_session/`;
  const { data } = await getAuthenticatedHttpClient()
    .post(url, QueryString.stringify(creds), requestConfig);
  return camelCaseObject({
    redirectUrl: data.redirect_url || `${getConfig().LMS_BASE_URL}/dashboard`,
    success: data.success || false,
  });
};

export {
  login,
};
