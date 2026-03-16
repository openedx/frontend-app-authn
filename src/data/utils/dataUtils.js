// Utility functions
import { getSiteConfig, getUrlByRouteRole } from '@openedx/frontend-base';
import * as QueryString from 'query-string';

import { dashboardRole } from '../../constants';
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

  if (queryParams.includes('track=pwreset')) {
    queryParams = queryParams.replace('?track=pwreset&', '?',).replace('?track=pwreset', '').replace('&track=pwreset', '').replace('?&', '?');
  }

  return `${path}${queryParams}`;
};

export const getAllPossibleQueryParams = (locationURl = null) => {
  const urlParams = locationURl ? QueryString.parseUrl(locationURl).query : QueryString.parse(window.location.search);
  const params = {};
  Object.entries(urlParams).forEach(([key, value]) => {
    if (AUTH_PARAMS.includes(key)) {
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

/**
 * Normalize a backend redirect URL: if the backend returns the LMS dashboard
 * URL (or nothing), replace it with the role-based dashboard URL so that SPA
 * navigation can be used when the dashboard lives in the same shell.
 */
export const normalizeRedirectUrl = (backendUrl) => {
  const dashboardUrl = getUrlByRouteRole(dashboardRole);
  const lmsDashboardUrl = `${getSiteConfig().lmsBaseUrl}/dashboard`;
  return (!backendUrl || backendUrl.startsWith(lmsDashboardUrl))
    ? dashboardUrl
    : backendUrl;
};

export const isHostAvailableInQueryParams = () => {
  const queryParams = getAllPossibleQueryParams();
  return 'host' in queryParams;
};
