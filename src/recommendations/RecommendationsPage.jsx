import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container, Hyperlink, Image, StatefulButton, Tab, Tabs,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import messages from './messages';
import RecommendationsList from './RecommendationsList';
import { DEFAULT_REDIRECT_URL } from '../data/constants';

const RecommendationsPage = ({ location }) => {
  const { formatMessage } = useIntl();

  const registrationResponse = location.state?.registrationResult;
  const userId = location.state?.userId;

  const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
  const POPULAR_PRODUCTS = JSON.parse(getConfig().POPULAR_PRODUCTS);
  const TRENDING_PRODUCTS = JSON.parse(getConfig().TRENDING_PRODUCTS);

  const handleRedirection = () => {
    window.history.replaceState(location.state, null, '');
    if (registrationResponse) {
      window.location.href = registrationResponse.redirectUrl;
    } else {
      window.location.href = DASHBOARD_URL;
    }
  };

  const handleSkip = (e) => {
    e.preventDefault();
    handleRedirection();
  };

  if (!registrationResponse) {
    global.location.assign(DASHBOARD_URL);
    return null;
  }

  if (!POPULAR_PRODUCTS.length || !TRENDING_PRODUCTS.length) {
    handleRedirection();
  }

  return (
    <>
      <Helmet>
        <title>{formatMessage(messages['recommendation.page.title'],
          { siteName: getConfig().SITE_NAME })}
        </title>
      </Helmet>
      <div className="d-flex flex-column vh-100 bg-light-200">
        <div className="mb-2">
          <div className="col-md-12 small-screen-top-stripe medium-screen-top-stripe extra-large-screen-top-stripe" />
          <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
            <Image className="logo" alt={getConfig().SITE_NAME} src={getConfig().LOGO_URL} />
          </Hyperlink>
        </div>
        <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 p-1">
          <Container id="course-recommendations" size="lg" className="recommendations-container">
            <h2 className="text-sm-center mb-4 text-left recommendations-container__heading">
              {formatMessage(messages['recommendation.page.heading'])}
            </h2>
            <Tabs
              variant="tabs"
              defaultActiveKey="popular"
              id="recommendations-selection"
            >
              <Tab tabClassName="mb-3" eventKey="popular" title={formatMessage(messages['recommendation.option.popular'])}>
                <RecommendationsList
                  recommendations={POPULAR_PRODUCTS}
                  userId={userId}
                />
              </Tab>
              <Tab eventKey="trending" title={formatMessage(messages['recommendation.option.trending'])}>
                <RecommendationsList
                  recommendations={TRENDING_PRODUCTS}
                  userId={userId}
                />
              </Tab>
            </Tabs>
          </Container>
          <div className="text-center">
            <StatefulButton
              className="font-weight-500"
              type="submit"
              variant="brand"
              labels={{
                default: formatMessage(messages['recommendation.skip.button']),
              }}
              onClick={handleSkip}
            />
          </div>
        </div>
      </div>
    </>
  );
};

RecommendationsPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      registrationResult: PropTypes.shape({
        redirectUrl: PropTypes.string,
      }),
      userId: PropTypes.number,
    }),
  }),

};

RecommendationsPage.defaultProps = {
  location: { state: {} },
};

export default RecommendationsPage;
