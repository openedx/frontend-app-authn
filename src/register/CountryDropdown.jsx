import React from 'react';
import { Icon } from '@edx/paragon';
import { ExpandMore, ExpandLess } from '@edx/paragon/icons';
import onClickOutside from 'react-onclickoutside';
import PropTypes from 'prop-types';
import { FormGroup } from '../common-components';
import { FORM_SUBMISSION_ERROR } from './data/constants';

class CountryDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayValue: '',
      icon: ExpandMore,
      errorMessage: '',
      showFieldError: true,
    };

    this.handleFocus = this.handleFocus.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
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
      const value = opt[this.props.valueKey];
      let displayValue = opt[this.props.displayValueKey];
      if (displayValue.length > 30) {
        displayValue = displayValue.substring(0, 30).concat('...');
      }

      return (
        <button type="button" className="dropdown-item" value={value} key={value} onClick={(e) => { this.handleItemClick(e); }}>
          {displayValue}
        </button>
      );
    });
  }

  setValue(value) {
    if (this.props.value === value) {
      return;
    }

    if (this.props.handleChange) {
      this.props.handleChange(value);
    }

    const opt = this.props.options.find((o) => o[this.props.valueKey] === value);
    if (opt && opt[this.props.displayValueKey] !== this.state.displayValue) {
      this.setState({ displayValue: opt[this.props.displayValueKey] });
    }
  }

  setDisplayValue(value) {
    const normalized = value.toLowerCase();
    const opt = this.props.options.find((o) => o[this.props.displayValueKey].toLowerCase() === normalized);
    if (opt) {
      this.setValue(opt[this.props.valueKey]);
      this.setState({ displayValue: opt[this.props.displayValueKey] });
    } else {
      this.setValue(null);
      this.setState({ displayValue: value });
    }
  }

  handleClick = () => {
    if (!this.props.value) {
      const dropDownItems = this.getItems();
      this.setState({
        dropDownItems, icon: ExpandLess, errorMessage: '', showFieldError: false,
      });
    }
  }

  handleOnChange = (e) => {
    const findstr = e.target.value;

    if (findstr.length > 0) {
      const filteredItems = this.getItems(findstr);
      this.setState({ dropDownItems: filteredItems, icon: ExpandLess, errorMessage: '' });
    } else {
      this.setState({ dropDownItems: '', icon: ExpandMore, errorMessage: this.props.errorMessage });
    }

    this.setDisplayValue(e.target.value);
  }

  handleClickOutside = () => {
    if (this.state.dropDownItems?.length > 0) {
      const msg = this.state.displayValue === '' ? this.props.errorMessage : '';
      this.setState(() => ({
        icon: ExpandMore,
        dropDownItems: '',
        errorMessage: msg,
      }));
    }
  }

  handleFocus(e) {
    if (this.props.handleFocus) { this.props.handleFocus(e); }
  }

  handleOnBlur(e) {
    if (this.props.handleBlur) { this.props.handleBlur(e); }
  }

  handleItemClick(e) {
    this.setValue(e.target.value);
    this.setState({ dropDownItems: '', icon: ExpandMore });
  }

  render() {
    return (
      <div>
        <FormGroup
          as="input"
          name={this.props.name}
          autoComplete="off"
          floatingLabel={this.props.floatingLabel}
          trailingElement={<Icon src={this.state.icon} />}
          handleChange={this.handleOnChange}
          handleClick={this.handleClick}
          handleBlur={this.handleOnBlur}
          handleFocus={this.handleOnFocus}
          value={this.state.displayValue}
          errorMessage={this.state.errorMessage}
        />
        <div className="dropdown-container -mt-4">
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
  handleChange: null,
  handleBlur: null,
  value: null,
  errorMessage: null,
};

CountryDropdown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.object),
  floatingLabel: PropTypes.string,
  valueKey: PropTypes.string.isRequired,
  displayValueKey: PropTypes.string.isRequired,
  handleFocus: PropTypes.func,
  handleChange: PropTypes.func,
  handleBlur: PropTypes.func,
  value: PropTypes.string,
  errorMessage: PropTypes.string,
  errorCode: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default onClickOutside(CountryDropdown);
