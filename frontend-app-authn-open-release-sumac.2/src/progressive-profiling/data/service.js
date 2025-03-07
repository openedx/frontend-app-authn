import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

// eslint-disable-next-line import/prefer-default-export
export async function patchAccount(username, commitValues) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/merge-patch+json' },
  };

  await getAuthenticatedHttpClient()
    .patch(
      `${getConfig().LMS_BASE_URL}/api/user/v1/accounts/${username}`,
      commitValues,
      requestConfig,
    )
    .catch((error) => {
      throw (error);
    });
}
