import React from 'react';
import { Provider } from 'react-redux';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';

import registerIcons from '../RegisterFaIcons';
import SocialAuthProviders from '../SocialAuthProviders';

registerIcons();
const mockStore = configureStore();

describe('SocialAuthProviders', () => {
  let props = {};

  const initialState = {
    register: {
      registrationFormData: {
        configurableFormFields: {
          marketingEmailsOptIn: true,
        },
      },
    },
  };
  const store = mockStore(initialState);
  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  const appleProvider = {
    id: 'oa2-apple-id',
    name: 'Apple',
    iconClass: null,
    iconImage: 'https://edx.devstack.lms/logo.png',
    loginUrl: '/auth/login/apple-id/?auth_entry=login&next=/dashboard',
  };

  const facebookProvider = {
    id: 'oa2-facebook',
    name: 'Facebook',
    iconClass: null,
    iconImage: 'https://edx.devstack.lms/facebook-logo.png',
    loginUrl: '/auth/login/facebook/?auth_entry=login&next=/dashboard',
  };

  it('should match social auth provider with iconImage snapshot', () => {
    props = { socialAuthProviders: [appleProvider, facebookProvider] };

    const tree = renderer.create(reduxWrapper(
      <IntlProvider locale="en">
        <SocialAuthProviders {...props} />
      </IntlProvider>,
    )).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should match social auth provider with iconClass snapshot', () => {
    props = {
      socialAuthProviders: [{
        ...appleProvider,
        iconClass: 'google',
        iconImage: null,
      }],
    };

    const tree = renderer.create(reduxWrapper(
      <IntlProvider locale="en">
        <SocialAuthProviders {...props} />
      </IntlProvider>,
    )).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should match social auth provider with default icon snapshot', () => {
    props = {
      socialAuthProviders: [{
        ...appleProvider,
        iconClass: 'default',
        iconImage: null,
      }],
    };

    const tree = renderer.create(reduxWrapper(
      <IntlProvider locale="en">
        <SocialAuthProviders {...props} />
      </IntlProvider>,
    )).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
