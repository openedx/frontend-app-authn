import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import * as analytics from '@edx/frontend-platform/analytics';
import { mount } from 'enzyme';

import LoginHelpLinks from '../LoginHelpLinks';
import { LOGIN_PAGE } from '../../data/constants';

const otherSignInIssues = 'https://login-issue-support-url.com';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn().mockReturnValue({ LOGIN_ISSUE_SUPPORT_LINK: otherSignInIssues }),
}));

jest.mock('@edx/frontend-platform/analytics');
analytics.sendTrackEvent = jest.fn();

describe('LoginHelpLinks', () => {
  let props = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      {children}
    </IntlProvider>
  );

  it('renders help links on button click', () => {
    props = {
      ...props,
      page: LOGIN_PAGE,
    };
    const loginHelpLinks = mount(reduxWrapper(<LoginHelpLinks {...props} />));

    expect(loginHelpLinks.find('.login-help').length).toBe(0);
    loginHelpLinks.find('button').first().simulate('click');
    expect(loginHelpLinks.find('.login-help').length).toBe(1);
  });

  it('should display login page help links', () => {
    props = {
      ...props,
      page: LOGIN_PAGE,
    };

    const wrapper = mount(reduxWrapper(<LoginHelpLinks {...props} />));
    wrapper.find('button').first().simulate('click');

    const loginHelpLinks = wrapper.find('a');

    expect(loginHelpLinks.at(0).prop('href')).toEqual('/reset');
    expect(loginHelpLinks.at(1).prop('href')).toEqual(otherSignInIssues);
  });

  it('should display forget password page help links', () => {
    props = {
      ...props,
      page: 'forget-password',
    };

    const wrapper = mount(reduxWrapper(<LoginHelpLinks {...props} />));
    wrapper.find('button').first().simulate('click');

    const loginHelpLinks = wrapper.find('a');

    expect(loginHelpLinks.at(0).prop('href')).toEqual('/register');
    expect(loginHelpLinks.at(1).prop('href')).toEqual(otherSignInIssues);
  });
});
