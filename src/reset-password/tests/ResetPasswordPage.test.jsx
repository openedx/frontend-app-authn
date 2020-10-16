import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';

import ResetPasswordPage from '../ResetPasswordPage';

jest.mock('../data/selectors', () => jest.fn().mockImplementation(() => ({ resetPasswordSelector: () => ({}) })));

const IntlResetPasswordPage = injectIntl(ResetPasswordPage);
const mockStore = configureStore();

describe('ResetPasswordPage', () => {
  let props = {};
  let store = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  beforeEach(() => {
    store = mockStore();
    props = {
      resetPassword: jest.fn(),
      status: null,
      token_status: 'pending',
      token: null,
    };
  });

  it('should match reset password default section snapshot', () => {
    props = {
      ...props,
      token: 'token',
      token_status: 'valid',
    };
    const tree = renderer.create(reduxWrapper(<IntlResetPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match invalid token message section snapshot', () => {
    props = {
      ...props,
      token_status: 'invalid',
    };
    const tree = renderer.create(reduxWrapper(<IntlResetPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match successful reset message section snapshot', () => {
    props = {
      ...props,
      token_status: 'valid',
      status: 'success',
    };
    const tree = renderer.create(reduxWrapper(<IntlResetPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match unsuccessful reset message section snapshot', () => {
    props = {
      ...props,
      token_status: 'valid',
      status: 'failure',
    };
    const tree = renderer.create(reduxWrapper(<IntlResetPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
