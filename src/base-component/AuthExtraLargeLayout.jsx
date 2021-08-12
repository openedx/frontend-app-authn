import React from 'react';

import classNames from 'classnames';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Col, Hyperlink, Image, Row,
} from '@edx/paragon';

import messages from './messages';

const AuthExtraLargeLayout = (props) => {
  const { intl, username, variant, toggleWelcomeText } = props;

  return (
    <div className="container row p-0 m-0 large-screen-container">
      <div className="col-md-9 p-0 screen-header-light">
        <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
          <Image alt="edx" className="logo position-absolute" src={getConfig().LOGO_WHITE_URL} />
        </Hyperlink>
        <div className="min-vh-100 d-flex align-items-center">
          <div>
            <Row>
              <Col xs={3}>
                <svg className={classNames(
                  'ml-5 mt-5',
                  {
                    'extra-large-svg-line': variant === 'xl',
                    'extra-extra-large-svg-line': variant === 'xxl',
                  },
                )}
                >
                  <line x1="60" y1="0" x2="5" y2="220" />
                </svg>
              </Col>
              <Col xs={9}>
                <div className={classNames(
                  'data-hj-suppress',
                  {
                    h3: variant === 'xl',
                    h2: variant === 'xxl',
                  },
                )}
                >
                  {intl.formatMessage(
                    messages['welcome.to.platform'], { siteName: getConfig().SITE_NAME, username },
                  )}
                </div>
                { !toggleWelcomeText ? (
                  <div
                    className={classNames(
                      'text-primary',
                      {
                        'display-1': variant === 'xl',
                        'display-2': variant === 'xxl',
                      },
                    )}
                  >
                    {intl.formatMessage(messages['complete.your.profile.1'])}
                    <span className="text-accent-a">
                      <br />
                      {intl.formatMessage(messages['complete.your.profile.2'])}
                    </span>
                  </div>
                ) : null}
              </Col>
            </Row>
          </div>
        </div>
      </div>
      <div className="col-md-3 p-0 screen-polygon">
        <svg
          width="100%"
          height="100%"
          className="m1-n1 large-screen-svg-light"
          preserveAspectRatio="xMaxYMin meet"
        >
          <g transform="skewX(171.6)">
            <rect x="0" y="0" height="100%" width="100%" />
          </g>
        </svg>
      </div>
    </div>
  );
};

AuthExtraLargeLayout.defaultProps = {
  variant: 'xl',
  toggleWelcomeText: false,
};

AuthExtraLargeLayout.propTypes = {
  intl: intlShape.isRequired,
  username: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['xl', 'xxl']),
  toggleWelcomeText: PropTypes.bool,
};

export default injectIntl(AuthExtraLargeLayout);
