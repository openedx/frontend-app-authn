// Utility functions
import * as QueryString from 'query-string';

import { AUTH_PARAMS } from '../constants';

export const getTpaProvider = (tpaHintProvider, primaryProviders, secondaryProviders) => {
  let tpaProvider = null;
  let skipHintedLogin = false;
  [...primaryProviders, ...secondaryProviders].forEach((provider) => {
    if (provider.id === tpaHintProvider) {
      tpaProvider = provider;
      if (provider.skipHintedLogin) {
        skipHintedLogin = true;
      }
    }
  });
  return { provider: tpaProvider, skipHintedLogin };
};

export const getTpaHint = () => {
  const params = QueryString.parse(window.location.search);
  let tpaHint = null;
  tpaHint = params.tpa_hint;
  if (!tpaHint) {
    const { next } = params;
    if (next) {
      const index = next.indexOf('tpa_hint=');
      if (index !== -1) {
        tpaHint = next.substring(index + 'tpa_hint='.length, next.length);
      }
    }
  }
  return tpaHint;
};

export const updatePathWithQueryParams = (path) => {
  let queryParams = window.location.search;

  if (!queryParams) {
    return path;
  }

  if (queryParams.indexOf('track=pwreset') > -1) {
    queryParams = queryParams.replace(
      '?track=pwreset&', '?',
    ).replace('?track=pwreset', '').replace('&track=pwreset', '').replace('?&', '?');
  }

  return `${path}${queryParams}`;
};

export const getAllPossibleQueryParams = (locationURl = null) => {
  const urlParams = locationURl ? QueryString.parseUrl(locationURl).query : QueryString.parse(window.location.search);
  const params = {};
  Object.entries(urlParams).forEach(([key, value]) => {
    if (AUTH_PARAMS.indexOf(key) > -1) {
      params[key] = value;
    }
  });

  return params;
};

export const getActivationStatus = () => {
  const params = QueryString.parse(window.location.search);

  return params.account_activation_status;
};

export const isScrollBehaviorSupported = () => 'scrollBehavior' in document.documentElement.style;

export const windowScrollTo = (options) => {
  if (isScrollBehaviorSupported()) {
    return window.scrollTo(options);
  }

  return window.scrollTo(options.top, options.left);
};

export const isHostAvailableInQueryParams = () => {
  const queryParams = getAllPossibleQueryParams();
  return 'host' in queryParams;
};
