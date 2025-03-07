import React from 'react';
import { Provider } from 'react-redux';

import { mergeConfig } from '@edx/frontend-platform';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render } from '@testing-library/react';
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
      const { container } = render(routerWrapper(reduxWrapper(<IntlCountryField {...props} />)));
      const countryInput = container.querySelector('input[name="country"]');

      fireEvent.blur(countryInput, {
        target: { value: '', name: 'country' },
      });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'country',
        emptyFieldValidation.country,
      );
    });

    it('should run country field validation when country name is invalid', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlCountryField {...props} />)));
      const countryInput = container.querySelector('input[name="country"]');

      fireEvent.blur(countryInput, {
        target: { value: 'Pak', name: 'country' },
      });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'country',
        'Country must match with an option available in the dropdown.',
      );
    });

    it('should not run country field validation when onBlur is fired by drop-down arrow icon click', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlCountryField {...props} />)));
      const countryInput = container.querySelector('input[name="country"]');
      const dropdownArrowIcon = container.querySelector('.btn-icon.pgn__form-autosuggest__icon-button');

      fireEvent.blur(countryInput, {
        target: { value: '', name: 'country' },
        relatedTarget: dropdownArrowIcon,
      });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(0);
    });

    it('should update errors for frontend validations', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlCountryField {...props} />)));
      const countryInput = container.querySelector('input[name="country"]');

      fireEvent.blur(countryInput, { target: { value: '', name: 'country' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith('country', emptyFieldValidation.country);
    });

    it('should clear error on focus', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlCountryField {...props} />)));
      const countryInput = container.querySelector('input[name="country"]');

      fireEvent.focus(countryInput);

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith('country', '');
    });

    it('should update state from country code present in redux store', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          backendCountryCode: 'PK',
        },
      });

      const { container } = render(routerWrapper(reduxWrapper(<IntlCountryField {...props} />)));

      container.querySelector('input[name="country"]');
      expect(props.onChangeHandler).toHaveBeenCalledTimes(1);
      expect(props.onChangeHandler).toHaveBeenCalledWith(
        { target: { name: 'country' } },
        { countryCode: 'PK', displayValue: 'Pakistan' },
      );
    });

    it('should set option on dropdown menu item click', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlCountryField {...props} />)));

      const dropdownButton = container.querySelector('.pgn__form-autosuggest__icon-button');
      fireEvent.click(dropdownButton);

      const dropdownItem = container.querySelector('.dropdown-item');
      fireEvent.click(dropdownItem);

      expect(props.onChangeHandler).toHaveBeenCalledTimes(2);
      expect(props.onChangeHandler).toHaveBeenCalledWith(
        { target: { name: 'country' } },
        { countryCode: 'PK', displayValue: 'Pakistan' },
      );
    });

    it('should set value on change', () => {
      const { container } = render(
        routerWrapper(reduxWrapper(<IntlCountryField {...props} />)),
      );

      const countryInput = container.querySelector('input[name="country"]');
      fireEvent.change(countryInput, { target: { value: 'pak', name: 'country' } });

      expect(props.onChangeHandler).toHaveBeenCalledTimes(2);
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

      const { container } = render(routerWrapper(reduxWrapper(<IntlCountryField {...props} />)));

      const feedbackElement = container.querySelector('div[feedback-for="country"]');
      expect(feedbackElement).toBeTruthy();
      expect(feedbackElement.textContent).toEqual('country error message');
    });
  });
});
