import Cookies from 'universal-cookie';
import { getConfig } from '@edx/frontend-platform';

export function setCookie(cookieName, cookieValue, cookieExpiry) {
  const cookies = new Cookies();
  const options = { domain: getConfig().COOKIE_DOMAIN, path: '/' };
  if (cookieExpiry) {
    options.expires = cookieExpiry;
  }
  cookies.set(cookieName, cookieValue, options);
}

export default function setSurveyCookie(surveyType) {
  const cookieName = getConfig().USER_SURVEY_COOKIE_NAME;
  if (cookieName) {
    const signupTimestamp = (new Date()).getTime();
    // set expiry to exactly 24 hours from now
    const cookieExpiry = new Date(signupTimestamp + 1 * 864e5);
    setCookie(cookieName, surveyType, cookieExpiry);
  }
}
