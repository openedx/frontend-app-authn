import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container, Hyperlink, Image, StatefulButton, Tab, Tabs,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import { POPULAR, TRENDING } from './data/constants';
import messages from './messages';
import useProducts from './ProductCard/hooks/useProducts';
import RecommendationsList from './RecommendationsList';
import { trackRecommendationsViewed } from './track';
import { DEFAULT_REDIRECT_URL } from '../data/constants';

const RecommendationsPage = ({ location, countryCode }) => {
  const { formatMessage } = useIntl();
  const registrationResponse = location.state?.registrationResult;
  const userId = location.state?.userId;

  const { popularProducts, trendingProducts } = useProducts(countryCode);
  const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);

  useEffect(() => {
    trackRecommendationsViewed(popularProducts, POPULAR, false, userId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    window.location.href = DASHBOARD_URL;
    return null;
  }

  if (!popularProducts.length || !trendingProducts.length) {
    handleRedirection();
  }

  const handleOnSelect = (tabKey) => {
    const recommendations = tabKey === POPULAR ? popularProducts : trendingProducts;
    trackRecommendationsViewed(recommendations, tabKey, false, userId);
  };

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
              defaultActiveKey={POPULAR}
              id="recommendations-selection"
              onSelect={handleOnSelect}
            >
              <Tab tabClassName="mb-3" eventKey={POPULAR} title={formatMessage(messages['recommendation.option.popular'])}>
                <RecommendationsList
                  recommendations={popularProducts}
                  userId={userId}
                />
              </Tab>
              <Tab tabClassName="mb-3" eventKey={TRENDING} title={formatMessage(messages['recommendation.option.trending'])}>
                <RecommendationsList
                  recommendations={trendingProducts}
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
  countryCode: PropTypes.string.isRequired,
};

RecommendationsPage.defaultProps = {
  location: { state: {} },
};

const mapStateToProps = state => ({
  countryCode: state.register.backendCountryCode,
});

export default connect(
  mapStateToProps,
  null,
)(RecommendationsPage);
