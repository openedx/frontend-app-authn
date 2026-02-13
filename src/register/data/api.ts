import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getHttpClient } from '@edx/frontend-platform/auth';
import * as QueryString from 'query-string';

const registerNewUserApi = async (registrationInformation) => {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    isPublic: true,
  };
  const url = `${getConfig().LMS_BASE_URL}/api/user/v2/account/registration/`;
  const { data } = await getAuthenticatedHttpClient()
    .post(url, QueryString.stringify(registrationInformation), requestConfig)
    .catch((e: any) => {
      throw (e);
    });

  return {
    redirectUrl: data.redirect_url || `${getConfig().LMS_BASE_URL}/dashboard`,
    success: data.success || false,
    authenticatedUser: data.authenticated_user,
  };
};

const getFieldsValidations = async (formPayload) => {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };
  const url = `${getConfig().LMS_BASE_URL}/api/user/v1/validation/registration`;
  const { data } = await getHttpClient()
    .post(
      url, QueryString.stringify(formPayload), requestConfig)
    .catch((e) => {
      throw (e);
    });

  return {
    fieldValidations: data,
  };
};

export {
  registerNewUserApi,
  getFieldsValidations,
};
