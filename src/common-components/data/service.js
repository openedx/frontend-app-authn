import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';

import { FIELD_LABELS } from './constants';

// eslint-disable-next-line import/prefer-default-export
export async function getThirdPartyAuthContext(urlParams) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    params: urlParams,
    isPublic: true,
  };

  const { data } = await getAuthenticatedHttpClient()
    .get(
      `${getConfig().LMS_BASE_URL}/api/mfe_context`,
      requestConfig,
    )
    .catch((e) => {
      throw (e);
    });
  return {
    fieldDescriptions: data.registrationFields || {},
    optionalFields: data.optionalFields || {},
    thirdPartyAuthContext: data.contextData || {},
  };
}

function extractCountryList(data) {
  return data?.fields
    .find(({ name }) => name === FIELD_LABELS.COUNTRY)
    ?.options?.map(({ value }) => (value)) || [];
}

export async function getCountryList() {
  try {
    const requestConfig = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      isPublic: true,
    };

    const { data } = await getAuthenticatedHttpClient()
      .get(
      `${getConfig().LMS_BASE_URL}/user_api/v1/account/registration/`,
      requestConfig,
      );
    return extractCountryList(data);
  } catch (e) {
    logError(e);
    return [];
  }
}
