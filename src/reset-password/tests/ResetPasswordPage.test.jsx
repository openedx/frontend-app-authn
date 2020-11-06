import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import * as auth from '@edx/frontend-platform/auth';

import ResetPasswordPage from '../ResetPasswordPage';

jest.mock('../data/selectors', () => jest.fn().mockImplementation(() => ({ resetPasswordSelector: () => ({}) })));
jest.mock('@edx/frontend-platform/auth');

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
      errors: null,
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
      errors: 'Password reset was unsuccessfull.',
    };
    const tree = renderer.create(reduxWrapper(<IntlResetPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should display invalid password message', async () => {
    const validationMessage = 'This password is too short. It must contain at least 8 characters. This password must contain at least 1 number.';
    const data = {
      validation_decisions: {
        password: validationMessage,
      },
    };
    props = {
      ...props,
      token_status: 'valid',
    };

    auth.getHttpClient = jest.fn(() => ({
      post: async () => ({
        data,
        catch: () => {},
      }),
    }));

    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    await act(async () => {
      await resetPasswordPage.find('input#reset-password-input').simulate('blur');
    });
    resetPasswordPage.update();
    expect(resetPasswordPage.find('#reset-password-input-invalid-feedback').text()).toEqual(validationMessage);
  });
});
