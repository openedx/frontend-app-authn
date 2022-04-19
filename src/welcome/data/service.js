import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

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

export async function getOptionalFieldData() {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  const { data } = await getAuthenticatedHttpClient()
    .get(
      `${getConfig().LMS_BASE_URL}/api/optional_fields`,
      requestConfig,
    )
    .catch((e) => {
      throw (e);
    });

  return data;
}
