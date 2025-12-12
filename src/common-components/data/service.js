import { getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';

export async function getThirdPartyAuthContext(urlParams) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    params: urlParams,
    isPublic: true,
  };

  const { data } = await getAuthenticatedHttpClient()
    .get(
      `${getSiteConfig().lmsBaseUrl}/api/mfe_context`,
      requestConfig,
    )
    .catch((e) => {
      throw (e);
    });
  return {
    fieldDescriptions: data.registrationFields ?? {},
    optionalFields: data.optionalFields ?? {},
    thirdPartyAuthContext: data.contextData ?? {},
  };
}
