import { getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';

const getThirdPartyAuthContext = async (urlParams: string) => {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    params: urlParams,
    isPublic: true,
  };

  const { data } = await getAuthenticatedHttpClient()
    .get(
      `${getSiteConfig().lmsBaseUrl}/api/mfe_context`,
      requestConfig,
    );
  return {
    fieldDescriptions: data.registrationFields || {},
    optionalFields: data.optionalFields || {},
    thirdPartyAuthContext: data.contextData || {},
  };
};

export {
  getThirdPartyAuthContext,
};
