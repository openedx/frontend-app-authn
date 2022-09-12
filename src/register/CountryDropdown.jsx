import React from 'react';

import { Icon, IconButton } from '@edx/paragon';
import { ExpandLess, ExpandMore } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import onClickOutside from 'react-onclickoutside';

import { FormGroup } from '../common-components';
import { COUNTRY_CODE_KEY, COUNTRY_DISPLAY_KEY, FORM_SUBMISSION_ERROR } from './data/constants';

class CountryDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);

    this.state = {
      displayValue: '',
      icon: this.expandMoreButton(),
      errorMessage: '',
      showFieldError: true,
    };
  }

  shouldComponentUpdate(nextProps) {
    const selectedCountry = this.props.options.find((o) => o[COUNTRY_CODE_KEY] === nextProps.value);
    if (this.props.value !== nextProps.value) {
      if (selectedCountry) {
        this.setState({
          displayValue: selectedCountry[COUNTRY_DISPLAY_KEY],
          showFieldError: false,
          errorMessage: nextProps.errorMessage,
        });
        return false;
      }
      // Set persisted country value as display value.
      this.setState({ displayValue: nextProps.value, showFieldError: true, errorMessage: nextProps.errorMessage });
      return false;
      // eslint-disable-next-line no-else-return
    } else if (nextProps.value && selectedCountry && this.state.displayValue === nextProps.value) {
      // Handling a case here where user enters a valid country code that needs to be
      // evaluated and set its display value.
      this.setState({ displayValue: selectedCountry[COUNTRY_DISPLAY_KEY] });
      return false;
    }
    if (this.props.errorCode !== nextProps.errorCode && nextProps.errorCode === 'invalid-country') {
      this.setState({ showFieldError: true, errorMessage: nextProps.errorMessage });
      return false;
    }
    if (this.state.errorMessage !== nextProps.errorMessage) {
      this.setState({ showFieldError: true, errorMessage: nextProps.errorMessage });
      return false;
    }
    return true;
  }

  static getDerivedStateFromProps(props, state) {
    if (props.errorCode === FORM_SUBMISSION_ERROR && state.showFieldError) {
      return { errorMessage: props.errorMessage };
    }
    return null;
  }

  getItems(strToFind = '') {
    let { options } = this.props;
    if (strToFind.length > 0) {
      options = options.filter((option) => (option.name.toLowerCase().includes(strToFind.toLowerCase())));
    }

    return options.map((opt) => {
      const value = opt[COUNTRY_CODE_KEY];
      const displayValue = opt[COUNTRY_DISPLAY_KEY];

      return (
        <button type="button" name="countryItem" className="dropdown-item data-hj-suppress" value={displayValue} key={value} onClick={(e) => { this.handleItemClick(e); }}>
          {displayValue.length > 30 ? displayValue.substring(0, 30).concat('...') : displayValue}
        </button>
      );
    });
  }

  handleOnChange = (e) => {
    const filteredItems = this.getItems(e.target.value);
    this.setState({
      dropDownItems: filteredItems,
      displayValue: e.target.value,
    });
  }

  handleClickOutside = () => {
    if (this.state.dropDownItems?.length > 0) {
      this.setState(() => ({
        icon: this.expandMoreButton(),
        dropDownItems: '',
      }));
    }
  }

  handleExpandLess() {
    this.setState({ dropDownItems: '', icon: this.expandMoreButton() });
  }

  handleExpandMore() {
    this.setState(prevState => ({
      dropDownItems: this.getItems(prevState.displayValue), icon: this.expandLessButton(), errorMessage: '', showFieldError: false,
    }));
  }

  handleFocus(e) {
    const { name, value } = e.target;
    this.setState(prevState => ({
      dropDownItems: this.getItems(name === 'country' ? value : prevState.displayValue),
      icon: this.expandLessButton(),
      errorMessage: '',
      showFieldError: false,
    }));
    if (this.props.handleFocus) { this.props.handleFocus(e); }
  }

  handleOnBlur(e, itemClicked = false) {
    const { name } = e.target;
    const countryValue = itemClicked ? e.target.value : this.state.displayValue;
    // For a better user experience, do not validate when focus out from 'country' field
    // and focus on 'countryItem' or 'countryExpand' button.
    if (e.relatedTarget && e.relatedTarget.name === 'countryItem' && (name === 'country' || name === 'countryExpand')) {
      return;
    }
    const normalized = countryValue.toLowerCase();
    const selectedCountry = this.props.options.find((o) => o[COUNTRY_DISPLAY_KEY].toLowerCase() === normalized);
    if (!selectedCountry) {
      this.setState({ errorMessage: this.props.errorMessage, showFieldError: true });
    }
    if (this.props.handleBlur) { this.props.handleBlur({ target: { name: 'country', value: countryValue } }); }
  }

  handleItemClick(e) {
    this.setState({ dropDownItems: '', icon: this.expandMoreButton() });
    this.handleOnBlur(e, true);
  }

  expandMoreButton() {
    return (
      <IconButton
        className="expand-more"
        onFocus={this.handleFocus}
        onBlur={this.handleOnBlur}
        name="countryExpand"
        src={ExpandMore}
        iconAs={Icon}
        size="sm"
        variant="secondary"
        alt="expand-more"
        onClick={(e) => { this.handleExpandMore(e); }}
      />
    );
  }

  expandLessButton() {
    return (
      <IconButton
        className="expand-less"
        onFocus={this.handleFocus}
        onBlur={this.handleOnBlur}
        name="countryExpand"
        src={ExpandLess}
        iconAs={Icon}
        size="sm"
        variant="secondary"
        alt="expand-less"
        onClick={(e) => { this.handleExpandLess(e); }}
      />
    );
  }

  render() {
    return (
      <div className="mb-4">
        <FormGroup
          as="input"
          name={this.props.name}
          autoComplete="chrome-off"
          className="mb-0"
          floatingLabel={this.props.floatingLabel}
          trailingElement={this.state.icon}
          handleChange={this.handleOnChange}
          handleBlur={this.handleOnBlur}
          handleFocus={this.handleFocus}
          value={this.state.displayValue}
          errorMessage={this.state.errorMessage}
        />
        <div className="dropdown-container">
          { this.state.dropDownItems?.length > 0 ? this.state.dropDownItems : null }
        </div>
      </div>
    );
  }
}

CountryDropdown.defaultProps = {
  options: null,
  floatingLabel: null,
  handleFocus: null,
  handleBlur: null,
  value: null,
  errorMessage: null,
  errorCode: null,
};

CountryDropdown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.object),
  floatingLabel: PropTypes.string,
  handleFocus: PropTypes.func,
  handleBlur: PropTypes.func,
  value: PropTypes.string,
  errorMessage: PropTypes.string,
  errorCode: PropTypes.string,
  name: PropTypes.string.isRequired,
};

export default onClickOutside(CountryDropdown);
