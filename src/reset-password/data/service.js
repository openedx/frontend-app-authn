import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import formurlencoded from 'form-urlencoded';

// eslint-disable-next-line import/prefer-default-export
export async function validateToken(token) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    isPublic: true,
  };

  const { data } = await getAuthenticatedHttpClient()
    .post(
      `${getConfig().LMS_BASE_URL}/user_api/v1/account/password_reset/token/validate/`,
      formurlencoded({ token }),
      requestConfig,
    )
    .catch((e) => {
      throw (e);
    });
  return data;
}

// eslint-disable-next-line import/prefer-default-export
export async function resetPassword(payload, token) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    isPublic: true,
  };

  const { data } = await getAuthenticatedHttpClient()
    .post(
      `${getConfig().LMS_BASE_URL}/password/reset/${token}/?track=pwreset`,
      formurlencoded(payload),
      requestConfig,
    )
    .catch((e) => {
      throw (e);
    });
  return data;
}
