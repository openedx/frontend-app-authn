import React from 'react';
import { Provider } from 'react-redux';

import { mergeConfig } from '@edx/frontend-platform';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { COUNTRY_CODE_KEY, COUNTRY_DISPLAY_KEY } from './validator';
import { CountryField } from '../index';

const IntlCountryField = injectIntl(CountryField);
const mockStore = configureStore();

jest.mock('react-router-dom', () => {
  const mockNavigation = jest.fn();

  // eslint-disable-next-line react/prop-types
  const Navigate = ({ to }) => {
    mockNavigation(to);
    return <div />;
  };

  return {
    ...jest.requireActual('react-router-dom'),
    Navigate,
    mockNavigate: mockNavigation,
  };
});

describe('CountryField', () => {
  let props = {};
  let store = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  const routerWrapper = children => (
    <Router>
      {children}
    </Router>
  );

  const initialState = {
    register: {},
  };

  beforeEach(() => {
    store = mockStore(initialState);
    props = {
      countryList: [{
        [COUNTRY_CODE_KEY]: 'PK',
        [COUNTRY_DISPLAY_KEY]: 'Pakistan',
      }],
      selectedCountry: {
        countryCode: '',
        displayValue: '',
      },
      errorMessage: '',
      onChangeHandler: jest.fn(),
      handleErrorChange: jest.fn(),
      onFocusHandler: jest.fn(),
    };
    window.location = { search: '' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Test Country Field', () => {
    mergeConfig({
      SHOW_CONFIGURABLE_EDX_FIELDS: true,
    });

    const emptyFieldValidation = {
      country: 'Select your country or region of residence',
    };

    it('should run country field validation when onBlur is fired', () => {
      const countryField = mount(routerWrapper(reduxWrapper(<IntlCountryField {...props} />)));
      countryField.find('input[name="country"]').simulate('blur', { target: { value: '', name: 'country' } });
      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'country',
        emptyFieldValidation.country,
      );
    });

    it('should not run country field validation when onBlur is fired by drop-down arrow icon click', () => {
      const countryField = mount(routerWrapper(reduxWrapper(<IntlCountryField {...props} />)));
      countryField.find('input[name="country"]').simulate('blur', {
        target: { value: '', name: 'country' },
        relatedTarget: { type: 'button', className: 'btn-icon pgn__form-autosuggest__icon-button' },
      });
      expect(props.handleErrorChange).toHaveBeenCalledTimes(0);
    });

    it('should update errors for frontend validations', () => {
      const countryField = mount(routerWrapper(reduxWrapper(<IntlCountryField {...props} />)));

      countryField.find('input[name="country"]').simulate('blur', { target: { value: '', name: 'country' } });
      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'country',
        emptyFieldValidation.country,
      );
    });

    it('should clear error on focus', () => {
      const countryField = mount(routerWrapper(reduxWrapper(<IntlCountryField {...props} />)));

      countryField.find('input[name="country"]').simulate('focus', { target: { value: '', name: 'country' } });
      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'country',
        '',
      );
    });

    it('should update state from country code present in redux store', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          backendCountryCode: 'PK',
        },
      });

      mount(routerWrapper(reduxWrapper(<IntlCountryField {...props} />)));
      expect(props.onChangeHandler).toHaveBeenCalledTimes(1);
      expect(props.onChangeHandler).toHaveBeenCalledWith(
        { target: { name: 'country' } },
        { countryCode: 'PK', displayValue: 'Pakistan' },
      );
    });

    it('should set option on dropdown menu item click', () => {
      const countryField = mount(routerWrapper(reduxWrapper(<IntlCountryField {...props} />)));

      countryField.find('.pgn__form-autosuggest__icon-button').first().simulate('click');
      countryField.find('.dropdown-item').first().simulate('click');

      expect(props.onChangeHandler).toHaveBeenCalledTimes(1);
      expect(props.onChangeHandler).toHaveBeenCalledWith(
        { target: { name: 'country' } },
        { countryCode: 'PK', displayValue: 'Pakistan' },
      );
    });

    it('should set value on change', () => {
      const countryField = mount(routerWrapper(reduxWrapper(<IntlCountryField {...props} />)));

      countryField.find('input[name="country"]').simulate(
        'change', { target: { value: 'pak', name: 'country' } },
      );

      expect(props.onChangeHandler).toHaveBeenCalledTimes(1);
      expect(props.onChangeHandler).toHaveBeenCalledWith(
        { target: { name: 'country' } },
        { countryCode: '', displayValue: 'pak' },
      );
    });

    it('should display error on invalid country input', () => {
      props = {
        ...props,
        errorMessage: 'country error message',
      };

      const countryField = mount(routerWrapper(reduxWrapper(<IntlCountryField {...props} />)));

      expect(countryField.find('div[feedback-for="country"]').text()).toEqual('country error message');
    });
  });
});
