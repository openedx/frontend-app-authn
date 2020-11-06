import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import querystring from 'querystring';

export async function postNewUser(registrationInformation) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    isPublic: true,
  };

  const { data } = await getAuthenticatedHttpClient()
    .post(
      `${getConfig().LMS_BASE_URL}/user_api/v1/account/registration/`,
      querystring.stringify(registrationInformation),
      requestConfig,
    )
    .catch((e) => {
      throw (e);
    });

  return data;
}

export async function login(creds) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    isPublic: true,
  };

  const { data } = await getAuthenticatedHttpClient()
    .post(
      `${getConfig().LMS_BASE_URL}/login_ajax`,
      querystring.stringify(creds),
      requestConfig,
    )
    .catch((e) => {
      throw (e);
    });

  return {
    redirectUrl: data.redirect_url || `${getConfig().LMS_BASE_URL}/dashboard`,
    success: data.success || false,
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export async function tpaProviders() {
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    isPublic: true,
  };

  // const { data } = await getAuthenticatedHttpClient()
  //   .post(
  //     `${getConfig().LMS_BASE_URL}/login_ajax`,
  //     requestConfig,
  //   )
  //   .catch((e) => {
  //     throw (e);
  //   });

  // return {
  //   secondaryProviders: data.secondary_providers || [1, 2, 3, 4, 5, 6, 7],
  // };
  await sleep(3000);
  return {
    secondaryProviders: [
      {
        "id": "saml-chalmers",
        "name": "Chalmers University",
        "iconClass": "fa-university",
        "iconImage": null,
        "loginUrl": "/auth/login/tpa-saml/?auth_entry=login\u0026next=%2Fdashboard\u0026idp=chalmers",
        "registerUrl": "/auth/login/tpa-saml/?auth_entry=register\u0026next=%2Fdashboard\u0026idp=chalmers"
      },
      {
        "id": "saml-curtin-sso",
        "name": "Curtin University",
        "iconClass": "fa-university",
        "iconImage": null,
        "loginUrl": "/auth/login/tpa-saml/?auth_entry=login\u0026next=%2Fdashboard\u0026idp=curtin-sso",
        "registerUrl": "/auth/login/tpa-saml/?auth_entry=register\u0026next=%2Fdashboard\u0026idp=curtin-sso"
      },
      {
        "id": "saml-gatech",
        "name": "Georgia Tech",
        "iconClass": "fa-university",
        "iconImage": null,
        "loginUrl": "/auth/login/tpa-saml/?auth_entry=login\u0026next=%2Fdashboard\u0026idp=gatech",
        "registerUrl": "/auth/login/tpa-saml/?auth_entry=register\u0026next=%2Fdashboard\u0026idp=gatech"
      },
      {
        "id": "saml-princeton",
        "name": "Princeton University",
        "iconClass": "fa-university",
        "iconImage": null,
        "loginUrl": "/auth/login/tpa-saml/?auth_entry=login\u0026next=%2Fdashboard\u0026idp=princeton",
        "registerUrl": "/auth/login/tpa-saml/?auth_entry=register\u0026next=%2Fdashboard\u0026idp=princeton"
      },
      {
        "id": "saml-berkeley-staging",
        "name": "University of California, Berkeley",
        "iconClass": "fa-university",
        "iconImage": null,
        "loginUrl": "/auth/login/tpa-saml/?auth_entry=login\u0026next=%2Fdashboard\u0026idp=berkeley-staging",
        "registerUrl": "/auth/login/tpa-saml/?auth_entry=register\u0026next=%2Fdashboard\u0026idp=berkeley-staging"
      },
      {
        "id": "saml-uq-staging",
        "name": "University of Queensland",
        "iconClass": "fa-university",
        "iconImage": null,
        "loginUrl": "/auth/login/tpa-saml/?auth_entry=login\u0026next=%2Fdashboard\u0026idp=uq-staging",
        "registerUrl": "/auth/login/tpa-saml/?auth_entry=register\u0026next=%2Fdashboard\u0026idp=uq-staging"
      },
      {
        "id": "saml-rotman-stg",
        "name": "University of Toronto Rotman School of Management",
        "iconClass": "fa-university",
        "iconImage": null,
        "loginUrl": "/auth/login/tpa-saml/?auth_entry=login\u0026next=%2Fdashboard\u0026idp=rotman-stg",
        "registerUrl": "/auth/login/tpa-saml/?auth_entry=register\u0026next=%2Fdashboard\u0026idp=rotman-stg"
      },
      {
        "id": "saml-testshib",
        "name": "testshib",
        "iconClass": "fa-sign-in",
        "iconImage": null,
        "loginUrl": "/auth/login/tpa-saml/?auth_entry=login\u0026next=%2Fdashboard\u0026idp=testshib",
        "registerUrl": "/auth/login/tpa-saml/?auth_entry=register\u0026next=%2Fdashboard\u0026idp=testshib"
      }
    ] || [],
  };
}
