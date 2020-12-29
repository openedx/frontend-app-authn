import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { createMemoryHistory } from 'history';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';

import ForgotPasswordPage from '../ForgotPasswordPage';

jest.mock('../data/selectors', () => jest.fn().mockImplementation(() => ({ forgotPasswordSelector: () => ({}) })));

const IntlForgotPasswordPage = injectIntl(ForgotPasswordPage);
const mockStore = configureStore();
const history = createMemoryHistory();

describe('ForgotPasswordPage', () => {
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
      forgotPassword: jest.fn(),
      status: null,
    };
  });

  it('should match default section snapshot', () => {
    const tree = renderer.create(reduxWrapper(<IntlForgotPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match forbidden section snapshot', () => {
    props = {
      ...props,
      status: 'forbidden',
    };
    const tree = renderer.create(reduxWrapper(<IntlForgotPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match pending section snapshot', () => {
    props = {
      ...props,
      status: 'pending',
    };
    const tree = renderer.create(reduxWrapper(<IntlForgotPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match success section snapshot', () => {
    props = {
      ...props,
      status: 'complete',
    };
    renderer.create(
      reduxWrapper(
        <Router history={history}>
          <IntlForgotPasswordPage {...props} />
        </Router>,
      ),
    );
    expect(history.location.pathname).toEqual('/login');
  });

  it('should display need other help signing in button', () => {
    const wrapper = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    expect(wrapper.find('button.field-link').text()).toEqual('Need other help signing in?');
  });

  it('should display email validation error message', async () => {
    const validationMessage = "Email must have at least 3 characters. The email address you've provided isn't formatted correctly.";
    const wrapper = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    await act(async () => {
      await wrapper.find('input#forgot-password-input').simulate('change', { target: { value: '', name: 'a' } });
    });
    wrapper.update();
    expect(wrapper.find('#email-invalid-feedback').text()).toEqual(validationMessage);
  });
});
