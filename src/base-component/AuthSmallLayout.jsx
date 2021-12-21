import React from 'react';

import classNames from 'classnames';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Col, Hyperlink, Image, Row,
} from '@edx/paragon';

import messages from './messages';

const AuthSmallLayout = (props) => {
  const { intl, username, variant } = props;

  return (
    <div className="small-screen-header-light">
      <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
        <Image alt={getConfig().SITE_NAME} className="logo" src={getConfig().LOGO_WHITE_URL} />
      </Hyperlink>
      <div className={classNames('d-flex mt-3', { 'pl-6': variant === 'sm' })}>
        <div>
          <Row>
            <Col xs={3}>
              <svg className={classNames(
                'mt-4\.5', // eslint-disable-line no-useless-escape
                {
                  'extra-small-svg-line': variant === 'xs',
                  'small-svg-line': variant === 'sm',
                },
              )}
              >
                <line x1="60" y1="0" x2="5" y2="220" />
              </svg>
            </Col>
            <Col xs={9}>
              <h5 className="data-hj-suppress">
                {intl.formatMessage(
                  messages['welcome.to.platform'], { siteName: getConfig().SITE_NAME, username },
                )}
              </h5>
              <h1>
                {intl.formatMessage(messages['complete.your.profile.1'])}
                <br />
                <span className="text-accent-a">
                  {intl.formatMessage(messages['complete.your.profile.2'])}
                </span>
              </h1>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

AuthSmallLayout.defaultProps = {
  variant: 'sm',
};

AuthSmallLayout.propTypes = {
  intl: intlShape.isRequired,
  username: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['sm', 'xs']),
};

export default injectIntl(AuthSmallLayout);
