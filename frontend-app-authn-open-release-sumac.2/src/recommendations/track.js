import { sendTrackEvent } from '@edx/frontend-platform/analytics';

export const LINK_TIMEOUT = 300;

export const eventNames = {
  recommendedProductClicked: 'edx.bi.user.recommended.product.clicked',
  recommendationsViewed: 'edx.bi.user.recommendations.viewed',
  skipButtonClicked: 'edx.bi.user.recommendations.skip.btn.clicked',
};

const generateProductKey = (product) => (
  product.cardType === 'program' ? `${product.title} [${product.uuid}]` : product.activeRunKey
);

export const getProductMapping = (recommendedProducts) => recommendedProducts.map((product) => ({
  product_key: generateProductKey(product),
  product_line: product.cardType,
  product_source: product.productSource.name,
}));

export const trackRecommendationClick = (product, position, userId) => {
  sendTrackEvent(eventNames.recommendedProductClicked, {
    page: 'authn_recommendations',
    position,
    recommendation_type: product.recommendationType,
    product_key: generateProductKey(product),
    product_line: product.cardType,
    product_source: product.productSource.name,
    user_id: userId,
  });

  const productUrl = product.url || product?.activeCourseRun?.marketingUrl;
  return setTimeout(() => { global.open(productUrl, '_blank'); }, LINK_TIMEOUT);
};

export const trackRecommendationsViewed = (recommendedProducts, type, userId) => {
  const viewedProductsList = getProductMapping(recommendedProducts);

  if (viewedProductsList && viewedProductsList.length) {
    sendTrackEvent(
      eventNames.recommendationsViewed, {
        page: 'authn_recommendations',
        recommendation_type: type,
        products: viewedProductsList,
        user_id: userId,
      },
    );
  }
};

export const trackSkipButtonClicked = (userId) => {
  sendTrackEvent(
    eventNames.skipButtonClicked, {
      page: 'authn_recommendations',
      user_id: userId,
    },
  );
};

export default {
  trackRecommendationClick,
  trackRecommendationsViewed,
  trackSkipButtonClicked,
};
