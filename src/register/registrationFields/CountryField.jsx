import React, { useEffect, useRef, useState } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@edx/paragon';
import { ExpandLess, ExpandMore } from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import { FormGroup } from '../../common-components';
import { COUNTRY_CODE_KEY, COUNTRY_DISPLAY_KEY } from '../data/constants';
import messages from '../messages';

const CountryField = (props) => {
  const { countryList, selectedCountry } = props;

  const dropdownRef = useRef(null);
  const { formatMessage } = useIntl();
  const [errorMessage, setErrorMessage] = useState(props.errorMessage);
  const [dropDownItems, setDropDownItems] = useState([]);
  const [displayValue, setDisplayValue] = useState('');
  const [trailingIcon, setTrailingIcon] = useState(null);

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
    setTrailingIcon(<ExpandMoreButton />);
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
    setTrailingIcon(<ExpandLessButton />);
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
    setTrailingIcon(<ExpandMoreButton />);
    setDropDownItems([]);
  };

  const handleExpandMore = () => {
    setTrailingIcon(<ExpandLessButton />);
    setDropDownItems(getDropdownItems());
  };

  const handleExpandLess = () => {
    setTrailingIcon(<ExpandMoreButton />);
    setDropDownItems([]);
  };

  const ExpandMoreButton = () => (
    <IconButton
      name="countryExpand"
      size="sm"
      variant="secondary"
      alt="expand-more"
      className="expand-more"
      iconAs={Icon}
      src={ExpandMore}
      onBlur={() => {}}
      onClick={handleExpandMore}
      onFocus={() => {}}
    />
  );

  const ExpandLessButton = () => (
    <IconButton
      name="countryExpand"
      size="sm"
      variant="secondary"
      alt="expand-less"
      className="expand-less"
      iconAs={Icon}
      src={ExpandLess}
      onBlur={() => {}}
      onClick={handleExpandLess}
      onFocus={() => {}}
    />
  );

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
    if (!trailingIcon) {
      setTrailingIcon(<ExpandMoreButton />);
    }
  }, [trailingIcon]);

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
        trailingElement={trailingIcon}
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
  countryList: PropTypes.arrayOf(PropTypes.object).isRequired,
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
