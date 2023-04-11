import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

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
    fieldDescriptions: data.registrationFields || data.registration_fields,
    optionalFields: data.optionalFields || data.optional_fields,
    thirdPartyAuthContext: data.contextData || data.context_data,
  };
}
