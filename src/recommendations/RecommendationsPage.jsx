import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl } from '@edx/frontend-platform/i18n';
import {
  Hyperlink, Image, StatefulButton,
} from '@edx/paragon';
import PropTypes from 'prop-types';

import { DEFAULT_REDIRECT_URL } from '../data/constants';
import messages from './messages';
import RecommendationsList from './RecommendationsList';

const recommendationData = [
  {
    activeRunKey: 'course-v1:MITx+6.86x+1T2023',
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/4c70ad9b-9602-49af-bf00-83fa4bf47708-dc4566d15250.jpg',
    marketingUrl:
    'https://www.edx.org/course/machine-learning-with-python-from-linear-models-to',
    objectId: 'course-4c70ad9b-9602-49af-bf00-83fa4bf47708',
    owners: [
      {
        key: 'MITx',
        logoImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/2a73d2ce-c34a-4e08-8223-83bca9d2f01d-2cc8854c6fee.png',
        name: 'Massachusetts Institute of Technology',
      },
    ],
    title: 'Machine Learning with Python: from Linear Models to Deep Learning',
  },
  {
    activeRunKey: 'course-v1:MITx+6.86x+1T2023',
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/4c70ad9b-9602-49af-bf00-83fa4bf47708-dc4566d15250.jpg',
    marketingUrl:
    'https://www.edx.org/course/machine-learning-with-python-from-linear-models-to',
    objectId: 'course-4c70ad9b-9602-49af-bf00-83fa4bf47708',
    owners: [
      {
        key: 'MITx',
        logoImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/2a73d2ce-c34a-4e08-8223-83bca9d2f01d-2cc8854c6fee.png',
        name: 'Massachusetts Institute of Technology',
      },
      {
        key: 'MITx',
        logoImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/2a73d2ce-c34a-4e08-8223-83bca9d2f01d-2cc8854c6fee.png',
        name: 'Massachusetts Institute of Technology',
      },
    ],
    title: 'Machine Learning with Python: from Linear Models to Deep Learning',
  },
  {
    activeRunKey: 'course-v1:MITx+6.86x+1T2023',
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/4c70ad9b-9602-49af-bf00-83fa4bf47708-dc4566d15250.jpg',
    marketingUrl:
    'https://www.edx.org/course/machine-learning-with-python-from-linear-models-to',
    objectId: 'course-4c70ad9b-9602-49af-bf00-83fa4bf47708',
    owners: [
      {
        key: 'MITx',
        logoImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/2a73d2ce-c34a-4e08-8223-83bca9d2f01d-2cc8854c6fee.png',
        name: 'Massachusetts Institute of Technology',
      },
    ],
    title: 'Machine Learning with Python: from Linear Models to Deep Learning',
  },
  {
    activeRunKey: 'course-v1:MITx+6.86x+1T2023',
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/4c70ad9b-9602-49af-bf00-83fa4bf47708-dc4566d15250.jpg',
    marketingUrl:
    'https://www.edx.org/course/machine-learning-with-python-from-linear-models-to',
    objectId: 'course-4c70ad9b-9602-49af-bf00-83fa4bf47708',
    owners: [
      {
        key: 'MITx',
        logoImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/2a73d2ce-c34a-4e08-8223-83bca9d2f01d-2cc8854c6fee.png',
        name: 'Massachusetts Institute of Technology',
      },
    ],
    title: 'Machine Learning with Python: from Linear Models to Deep Learning',
  },
];

const RecommendationsPage = (props) => {
  const { intl, location } = props;
  const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
  const registrationResponse = location.state?.registrationResult;

  if (!registrationResponse) {
    global.location.assign(DASHBOARD_URL);
    return null;
  }

  const handleSkip = (e) => {
    e.preventDefault();
    window.history.replaceState(location.state, null, '');
    if (registrationResponse) {
      window.location.href = registrationResponse.redirectUrl;
    } else {
      window.location.href = DASHBOARD_URL;
    }
  };

  return (
    <div className="d-flex flex-column vh-100">
      <div className="mb-2">
        <div className="col-md-12 small-screen-top-stripe medium-screen-top-stripe extra-large-screen-top-stripe" />
        <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
          <Image className="logo" alt={getConfig().SITE_NAME} src={getConfig().LOGO_URL} />
        </Hyperlink>
      </div>
      <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 p-1">
        <RecommendationsList
          title={intl.formatMessage(messages['recommendation.page.heading'])}
          recommendations={recommendationData}
        />
        <div className="text-center">
          <StatefulButton
            className=" font-weight-500"
            type="submit"
            variant="brand"
            labels={{
              default: intl.formatMessage(messages['recommendation.skip.button']),
            }}
            onClick={handleSkip}
          />
        </div>
      </div>
    </div>
  );
};

RecommendationsPage.propTypes = {
  intl: PropTypes.objectOf(PropTypes.object).isRequired,
  location: PropTypes.shape({
    state: PropTypes.object,
  }),

};

RecommendationsPage.defaultProps = {
  location: { state: {} },
};

export default injectIntl(RecommendationsPage);
