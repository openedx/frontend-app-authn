import { getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';

const patchAccount = async (username, commitValues) => {
  const requestConfig = {
    headers: { 'Content-Type': 'application/merge-patch+json' },
  };

  await getAuthenticatedHttpClient()
    .patch(
      `${getSiteConfig().lmsBaseUrl}/api/user/v1/accounts/${username}`,
      commitValues,
      requestConfig,
    )
    .catch((error) => {
      throw (error);
    });
};

export {
  patchAccount,
};
