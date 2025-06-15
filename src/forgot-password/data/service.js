import { getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';
import formurlencoded from 'form-urlencoded';

export async function forgotPassword(email) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    isPublic: true,
  };

  const { data } = await getAuthenticatedHttpClient()
    .post(
      `${getSiteConfig().lmsBaseUrl}/account/password`,
      formurlencoded({ email }),
      requestConfig,
    )
    .catch((e) => {
      throw (e);
    });

  return data;
}
