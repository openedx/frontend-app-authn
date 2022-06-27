import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Col, Hyperlink, Image, Row,
} from '@edx/paragon';
import PropTypes from 'prop-types';

import messages from './messages';

const AuthMediumLayout = (props) => {
  const { intl, username } = props;

  return (
    <div className="container row p-0 mb-3 medium-container">
      <div className="col-md-10 p-0 screen-header-light">
        <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
          <Image alt={getConfig().SITE_NAME} className="logo" src={getConfig().LOGO_WHITE_URL} />
        </Hyperlink>
        <div className="d-flex align-items-center justify-content-center ml-6">
          <div>
            <Row>
              <Col xs={3}>
                <svg
                  role="img"
                  aria-label=""
                  focusable={false}
                  className="medium-svg-line ml-5 mt-5"
                >
                  <line x1="60" y1="0" x2="5" y2="220" />
                </svg>
              </Col>
              <Col xs={9}>
                <h3 className="data-hj-suppress">
                  {intl.formatMessage(
                    messages['welcome.to.platform'], { siteName: getConfig().SITE_NAME, username },
                  )}
                </h3>
                <div className="display-1 text-primary">
                  {intl.formatMessage(messages['complete.your.profile.1'])}
                  <span className="text-accent-a">
                    <br />
                    {intl.formatMessage(messages['complete.your.profile.2'])}
                  </span>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
      <div className="col-md-2 p-0 screen-polygon">
        <svg
          width="100%"
          height="100%"
          className="medium-screen-svg-light"
          preserveAspectRatio="xMaxYMin meet"
        >
          <g transform="skewX(168)">
            <rect x="0" y="0" height="100%" width="100%" />
          </g>
        </svg>
      </div>
    </div>
  );
};

AuthMediumLayout.propTypes = {
  intl: intlShape.isRequired,
  username: PropTypes.string.isRequired,
};

export default injectIntl(AuthMediumLayout);
