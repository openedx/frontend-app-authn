import Cookies from 'universal-cookie';

export default function setCookie(cookieName, cookieValue, cookieDomain, cookieExpiry) {
  if (cookieName) { // To avoid setting getting exception when setting cookie with undefined names.
    const cookies = new Cookies();
    const options = { domain: cookieDomain, path: '/' };
    if (cookieExpiry) {
      options.expires = cookieExpiry;
    }
    cookies.set(cookieName, cookieValue, options);
  }
}
