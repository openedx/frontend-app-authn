// Utility functions

import * as QueryString from 'query-string';
import { AUTH_PARAMS } from '../constants';

export default function processLink(link) {
  let matches;
  link.replace(/(.*?)<a href=["']([^"']*).*?>([^<]+)<\/a>(.*)/g, function () { // eslint-disable-line func-names
    matches = Array.prototype.slice.call(arguments, 1, 5); // eslint-disable-line  prefer-rest-params
  });
  return matches;
}

export const getTpaProvider = (tpaHintProvider, primaryProviders, secondaryProviders) => {
  let tpaProvider = null;
  primaryProviders.forEach((provider) => {
    if (provider.id === tpaHintProvider) {
      tpaProvider = provider;
    }
  });

  if (!tpaProvider) {
    secondaryProviders.forEach((provider) => {
      if (provider.id === tpaHintProvider) {
        tpaProvider = provider;
      }
    });
  }
  return tpaProvider;
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
  const queryParams = window.location.search;

  if (!queryParams) {
    return path;
  }

  return `${path}${queryParams}`;
};

export const getAllPossibleQueryParam = () => {
  const urlParams = QueryString.parse(window.location.search);
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
