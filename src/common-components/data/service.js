import { camelCaseObject, convertKeyNames, getConfig } from '@edx/frontend-platform';
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
    fieldDescriptions: data.registration_fields || {},
    optionalFields: data.optional_fields || {},
    // For backward compatibility with the API, once https://github.com/openedx/edx-platform/pull/30198 is merged
    // and deployed update it to use data.context_data
    thirdPartyAuthContext: camelCaseObject(
      convertKeyNames(data.context_data || data, { fullname: 'name' }),
    ),
  };
}
