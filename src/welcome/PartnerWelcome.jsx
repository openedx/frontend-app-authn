import React, { useState } from 'react';

import PropTypes from 'prop-types';
import {
  Form,
  Button,
  StatefulButton,
  Hyperlink,
  Icon,
  Collapsible,
  Image,
} from '@edx/paragon';
import { Pin, Tag, Email } from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';

const logoStyle = { height: '4rem' };

const PartnerWelcome = ({ onComplete }) => {
  const [formValues, setFormValues] = useState({ email: '', location: '', search: '' });
  const onChangeHandler = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const submitToPartnerButton = (href) => (
    <Button
      target="_blank"
      rel="noopener noreferrer"
      as="a"
      href={href}
      size="sm"
    >
      Submit
    </Button>
  );

  return (
    <>
      <Form>
        <Collapsible
          styling="card-lg"
          title={<Image style={logoStyle} src="https://www.ziprecruiter.com/zrs/starterview/f810ae13/img/logos/ziprecruiter-blacktext.svg" fluid />}
        >
          <Form.Group controlId="email">
            <Form.Control
              name="email"
              value={formValues.email}
              onChange={(e) => onChangeHandler(e)}
              floatingLabel="Email"
              trailingElement={<Icon src={Email} />}
            />
          </Form.Group>

          <Form.Group controlId="location">
            <Form.Control
              name="location"
              value={formValues.location}
              onChange={(e) => onChangeHandler(e)}
              floatingLabel="Location"
              trailingElement={<Icon src={Pin} />}
            />
          </Form.Group>

          <Form.Group controlId="search">
            <Form.Control
              name="search"
              value={formValues.search}
              onChange={(e) => onChangeHandler(e)}
              floatingLabel="Desired Title"
              trailingElement={<Icon src={Tag} />}

            />
          </Form.Group>
          <Form.Group>
            {submitToPartnerButton('https://www.ziprecruiter.com/')}
          </Form.Group>
        </Collapsible>

        <Collapsible
          styling="card-lg"
          title={<Image style={logoStyle} src="https://content.linkedin.com/content/dam/me/business/en-us/amp/brand-site/v2/bg/LI-Logo.svg.original.svg" fluid />}
        >
          <Form.Group controlId="email">
            <Form.Control
              name="email"
              value={formValues.email}
              onChange={(e) => onChangeHandler(e)}
              floatingLabel="Email"
              trailingElement={<Icon src={Email} />}
            />
          </Form.Group>

          <Form.Group controlId="location">
            <Form.Control
              name="location"
              value={formValues.location}
              onChange={(e) => onChangeHandler(e)}
              floatingLabel="Location"
              trailingElement={<Icon src={Pin} />}
            />
          </Form.Group>

          <Form.Group controlId="search">
            <Form.Control
              name="search"
              value={formValues.search}
              onChange={(e) => onChangeHandler(e)}
              floatingLabel="Desired Title"
              trailingElement={<Icon src={Tag} />}

            />
          </Form.Group>

          <Form.Group>
            {submitToPartnerButton('https://www.linkedin.com/')}
          </Form.Group>
        </Collapsible>

        <span className="progressive-profiling-support">
          <Hyperlink
            isInline
            variant="muted"
            destination={getConfig().WELCOME_PAGE_SUPPORT_LINK}
            target="_blank"
            showLaunchIcon={false}
          >
            Learn more about our partners
          </Hyperlink>
        </span>
        <div className="d-flex mt-4">
          <StatefulButton
            type="submit"
            variant="brand"
            className="login-button-width"
            state="active"
            labels={{
              default: 'Complete',
              pending: '',
            }}
            onClick={onComplete}
            onMouseDown={(e) => e.preventDefault()}
          />
        </div>
      </Form>
    </>
  );
};

PartnerWelcome.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default PartnerWelcome;
