import Cookies from 'universal-cookie';
import { getConfig } from '@edx/frontend-platform';

export default function setSurveyCookie(surveyType) {
  const cookieName = getConfig().USER_SURVEY_COOKIE_NAME;
  if (cookieName) {
    const cookies = new Cookies();
    const signupTimestamp = (new Date()).getTime();
    // set expiry to exactly 24 hours from now
    const cookieExpiry = new Date(signupTimestamp + 1 * 864e5);
    const options = { domain: getConfig().COOKIE_DOMAIN, expires: cookieExpiry, path: '/' };
    cookies.set(cookieName, surveyType, options);
  }
}
