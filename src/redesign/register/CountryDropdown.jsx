import React from 'react';
import { Icon, IconButton } from '@edx/paragon';
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
      icon: this.expandMoreButton(),
      errorMessage: '',
      showFieldError: true,
    };

    this.handleFocus = this.handleFocus.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.value !== nextProps.value && nextProps.value !== null) {
      const opt = this.props.options.find((o) => o[this.props.valueKey] === nextProps.value);
      if (opt && opt[this.props.displayValueKey] !== this.state.displayValue) {
        this.setState({ displayValue: opt[this.props.displayValueKey], showFieldError: false });
      }
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
      this.setState({ displayValue: opt[this.props.displayValueKey], showFieldError: false });
    }
  }

  setDisplayValue(value) {
    const normalized = value.toLowerCase();
    const opt = this.props.options.find((o) => o[this.props.displayValueKey].toLowerCase() === normalized);
    if (opt) {
      this.setValue(opt[this.props.valueKey]);
      this.setState({ displayValue: opt[this.props.displayValueKey], showFieldError: false });
    } else {
      this.setValue(null);
      this.setState({ displayValue: value, showFieldError: true });
    }
  }

  handleClick = (e) => {
    const dropDownItems = this.getItems(e.target.value);
    if (dropDownItems?.length > 1) {
      this.setState({ dropDownItems, icon: this.expandLessButton(), errorMessage: '' });
    }

    if (this.state.dropDownItems?.length > 0) {
      this.setState({ dropDownItems: '', icon: this.expandMoreButton(), errorMessage: '' });
    }
  }

  handleOnChange = (e) => {
    const findstr = e.target.value;

    if (findstr.length > 0) {
      const filteredItems = this.getItems(findstr);
      this.setState({ dropDownItems: filteredItems, icon: this.expandLessButton(), errorMessage: '' });
    } else {
      this.setState({ dropDownItems: '', icon: this.expandMoreButton(), errorMessage: this.props.errorMessage });
    }

    this.setDisplayValue(e.target.value);
  }

  handleClickOutside = () => {
    if (this.state.dropDownItems?.length > 0) {
      const msg = this.state.displayValue === '' ? this.props.errorMessage : '';
      this.setState(() => ({
        icon: this.expandMoreButton(),
        dropDownItems: '',
        errorMessage: msg,
      }));
    }
  }

  handleExpandLess() {
    this.setState({ dropDownItems: '', icon: this.expandMoreButton() });
  }

  handleExpandMore(e) {
    const dropDownItems = this.getItems(e.target.value);
    this.setState({
      dropDownItems, icon: this.expandLessButton(), errorMessage: '', showFieldError: false,
    });
  }

  handleFocus(e) {
    if (this.props.handleFocus) { this.props.handleFocus(e); }
  }

  handleOnBlur(e) {
    if (this.props.handleBlur) { this.props.handleBlur(e); }
  }

  handleItemClick(e) {
    this.setValue(e.target.value);
    this.setState({ dropDownItems: '', icon: this.expandMoreButton() });
  }

  expandMoreButton() {
    return (
      <IconButton
        className="expand-more"
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
      <div>
        <FormGroup
          as="input"
          name={this.props.name}
          autoComplete="off"
          className="mb-0"
          floatingLabel={this.props.floatingLabel}
          trailingElement={this.state.icon}
          handleChange={this.handleOnChange}
          handleClick={this.handleClick}
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
  handleChange: null,
  handleBlur: null,
  value: null,
  errorMessage: null,
  errorCode: null,
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
  errorCode: PropTypes.string,
  name: PropTypes.string.isRequired,
};

export default onClickOutside(CountryDropdown);
