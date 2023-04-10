import React from 'react';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';

import registerIcons from '../RegisterFaIcons';
import SocialAuthProviders from '../SocialAuthProviders';

registerIcons();

describe('SocialAuthProviders', () => {
  let props = {};

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

    const tree = renderer.create(
      <IntlProvider locale="en">
        <SocialAuthProviders {...props} />
      </IntlProvider>,
    ).toJSON();

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

    const tree = renderer.create(
      <IntlProvider locale="en">
        <SocialAuthProviders {...props} />
      </IntlProvider>,
    ).toJSON();

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

    const tree = renderer.create(
      <IntlProvider locale="en">
        <SocialAuthProviders {...props} />
      </IntlProvider>,
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should set tpaHintedAuthentication in localStorage if skipRegistrationForm is true in provider', () => {
    localStorage.clear();
    props = {
      socialAuthProviders: [{
        ...appleProvider,
        iconClass: 'default',
        iconImage: null,
        skipRegistrationForm: true,
      }],
    };

    const tree = mount(
      <IntlProvider locale="en">
        <SocialAuthProviders {...props} />
      </IntlProvider>,
    );

    tree.find(`button#${appleProvider.id}`).simulate('click');
    expect(localStorage.getItem('tpaHintedAuthentication')).toEqual('true');
  });

  it('should not set tpaHintedAuthentication in localStorage if skipRegistrationForm is false in provider', () => {
    localStorage.clear();
    props = {
      socialAuthProviders: [{
        ...appleProvider,
        iconClass: 'default',
        iconImage: null,
        skipRegistrationForm: false,
      }],
    };

    const tree = mount(
      <IntlProvider locale="en">
        <SocialAuthProviders {...props} />
      </IntlProvider>,
    );

    tree.find(`button#${appleProvider.id}`).simulate('click');
    expect(localStorage.getItem('tpaHintedAuthentication')).toEqual(null);
  });
});
