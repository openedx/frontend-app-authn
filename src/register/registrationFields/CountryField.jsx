import React, { useEffect, useRef, useState } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@edx/paragon';
import { ExpandLess, ExpandMore } from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import { FormGroup } from '../../common-components';
import {
  COUNTRY_CODE_KEY, COUNTRY_DISPLAY_KEY, EXPAND_LESS_ICON, EXPAND_MORE_ICON,
} from '../data/constants';
import messages from '../messages';

const CountryField = (props) => {
  const { countryList, selectedCountry } = props;

  const dropdownRef = useRef(null);
  const { formatMessage } = useIntl();
  const [errorMessage, setErrorMessage] = useState(props.errorMessage);
  const [dropDownItems, setDropDownItems] = useState([]);
  const [displayValue, setDisplayValue] = useState('');
  const [trailingIcon, setTrailingIcon] = useState(EXPAND_MORE_ICON);

  const onBlurHandler = (event, itemClicked = false, countryName = '') => {
    const { name } = event.target;
    const relatedName = event.relatedTarget ? event.relatedTarget.name : '';
    // For a better user experience, do not validate when focus out from 'country' field
    // and focus on 'countryItem' or 'countryExpand' button.
    if ((relatedName === 'countryItem' || relatedName === 'countryExpand') && name === 'country') {
      return;
    }
    const countryValue = itemClicked ? countryName : displayValue;
    if (props.onBlurHandler) {
      props.onBlurHandler({ target: { name: 'country', value: countryValue } });
    }
    setTrailingIcon(EXPAND_MORE_ICON);
    setDropDownItems([]);
  };

  const getDropdownItems = (countryToFind = null) => {
    let updatedCountryList = countryList;
    if (countryToFind) {
      updatedCountryList = countryList.filter(
        (option) => (option.name.toLowerCase().includes(countryToFind.toLowerCase())),
      );
    }

    return updatedCountryList.map((country) => {
      const countryName = country[COUNTRY_DISPLAY_KEY];
      return (
        <button
          type="button"
          name="countryItem"
          className="dropdown-item data-hj-suppress"
          value={countryName}
          key={country[COUNTRY_CODE_KEY]}
          onClick={(event) => onBlurHandler(event, true, countryName)}
          /* This event will prevent the blur event to be fired,
           as blur event is having higher priority than click event and restricts the click event.
          */
          onMouseDown={(event) => event.preventDefault()}
        >
          {countryName.length > 30 ? countryName.substring(0, 30).concat('...') : countryName}
        </button>
      );
    });
  };

  const onFocusHandler = (event) => {
    const { name, value } = event.target;
    setDropDownItems(getDropdownItems(name === 'country' ? value : displayValue));
    setTrailingIcon(EXPAND_LESS_ICON);
    setErrorMessage('');
    if (props.onFocusHandler) { props.onFocusHandler(event); }
  };

  const onChangeHandler = (event) => {
    const filteredItems = getDropdownItems(event.target.value);
    setDropDownItems(filteredItems);
    setDisplayValue(event.target.value);
    if (props.onChangeHandler) { props.onChangeHandler(event, { countryCode: '', displayValue: event.target.value }); }
  };

  const handleOnClickOutside = () => {
    setTrailingIcon(EXPAND_MORE_ICON);
    setDropDownItems([]);
  };

  const handleTrailingIconClick = () => {
    if (trailingIcon === EXPAND_MORE_ICON) {
      setDropDownItems(getDropdownItems());
      setTrailingIcon(EXPAND_LESS_ICON);
    } else {
      setDropDownItems([]);
      setTrailingIcon(EXPAND_MORE_ICON);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleOnClickOutside();
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  useEffect(() => {
    if (selectedCountry.displayValue) {
      setDisplayValue(selectedCountry.displayValue);
    }
  }, [selectedCountry]);

  useEffect(() => {
    setErrorMessage(props.errorMessage);
  }, [props.errorMessage]);

  return (
    <div ref={dropdownRef} className="mb-4">
      <FormGroup
        as="input"
        name="country"
        autoComplete="chrome-off"
        className="mb-0"
        floatingLabel={formatMessage(messages['registration.country.label'])}
        trailingElement={(
          <IconButton
            name="countryExpand"
            size="sm"
            variant="secondary"
            alt="expand-dropdown"
            iconAs={Icon}
            src={trailingIcon === EXPAND_MORE_ICON ? ExpandMore : ExpandLess}
            onBlur={() => {}}
            onClick={handleTrailingIconClick}
            onFocus={() => {}}
          />
        )}
        value={displayValue}
        errorMessage={errorMessage}
        handleChange={onChangeHandler}
        handleBlur={onBlurHandler}
        handleFocus={onFocusHandler}
      />
      <div className="dropdown-container">
        { dropDownItems?.length > 0 ? dropDownItems : null }
      </div>
    </div>
  );
};

CountryField.propTypes = {
  countryList: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string,
      name: PropTypes.string,
    }),
  ).isRequired,
  errorMessage: PropTypes.string,
  onBlurHandler: PropTypes.func.isRequired,
  onChangeHandler: PropTypes.func.isRequired,
  onFocusHandler: PropTypes.func.isRequired,
  selectedCountry: PropTypes.shape({
    displayValue: PropTypes.string,
    countryCode: PropTypes.string,
  }),
};

CountryField.defaultProps = {
  errorMessage: null,
  selectedCountry: {
    value: '',
  },
};

export default CountryField;
