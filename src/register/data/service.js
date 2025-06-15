import { getAuthenticatedHttpClient, getSiteConfig, getHttpClient } from '@openedx/frontend-base';
import * as QueryString from 'query-string';

export async function registerRequest(registrationInformation) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    isPublic: true,
  };

  const { data } = await getAuthenticatedHttpClient()
    .post(
      `${getSiteConfig().lmsBaseUrl}/api/user/v2/account/registration/`,
      QueryString.stringify(registrationInformation),
      requestConfig,
    )
    .catch((e) => {
      throw (e);
    });

  return {
    redirectUrl: data.redirect_url || `${getSiteConfig().lmsBaseUrl}/dashboard`,
    success: data.success || false,
    authenticatedUser: data.authenticated_user,
  };
}

export async function getFieldsValidations(formPayload) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  const { data } = await getHttpClient()
    .post(
      `${getSiteConfig().lmsBaseUrl}/api/user/v1/validation/registration`,
      QueryString.stringify(formPayload),
      requestConfig,
    )
    .catch((e) => {
      throw (e);
    });

  return {
    fieldValidations: data,
  };
}
