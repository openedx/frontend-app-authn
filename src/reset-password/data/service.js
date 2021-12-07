import { getConfig } from '@edx/frontend-platform';
import { getHttpClient } from '@edx/frontend-platform/auth';
import formurlencoded from 'form-urlencoded';

// eslint-disable-next-line import/prefer-default-export
export async function validateToken(token) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  const { data } = await getHttpClient()
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
export async function resetPassword(payload, token, queryParams) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };
  const url = new URL(`${getConfig().LMS_BASE_URL}/password/reset/${token}/`);

  if (queryParams.is_account_recovery) {
    url.searchParams.append('is_account_recovery', true);
  }

  const { data } = await getHttpClient()
    .post(url.href, formurlencoded(payload), requestConfig)
    .catch((e) => {
      throw (e);
    });
  return data;
}

export async function validatePassword(payload) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };
  const { data } = await getHttpClient()
    .post(
      `${getConfig().LMS_BASE_URL}/api/user/v1/validation/registration`,
      formurlencoded(payload),
      requestConfig,
    )
    .catch((e) => {
      throw (e);
    });

  let errorMessage = '';
  // Be careful about grabbing this message, since we could have received an HTTP error or the
  // endpoint didn't give us what we expect. We only care if we get a clear error message.
  if (data.validation_decisions && data.validation_decisions.password) {
    errorMessage = data.validation_decisions.password;
  }

  return errorMessage;
}
