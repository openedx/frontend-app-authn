import { sendTrackEvent } from '@edx/frontend-platform/analytics';

export const LINK_TIMEOUT = 300;

export const eventNames = {
  recommendedProductClicked: 'edx.bi.user.recommended.product.clicked',
  recommendationsGroup: 'edx.bi.user.recommendations.group',
  recommendationsViewed: 'edx.bi.user.recommendations.viewed',
};

export const createLinkTracker = (tracker, href, openInNewTab = false) => (e) => {
  e.preventDefault();
  tracker();
  if (openInNewTab) {
    return setTimeout(() => { global.open(href, '_blank'); }, LINK_TIMEOUT);
  }
  return setTimeout(() => { global.location.href = href; }, LINK_TIMEOUT);
};

const generateProductKey = (product) => {
  const productKey = product.cardType === 'program' ? `${product.title} [${product.uuid}]` : product.activeRunKey;
  return productKey;
};

export const trackRecommendationClick = (product, position, isControl, userId) => {
  sendTrackEvent(eventNames.recommendedProductClicked, {
    page: 'authn_recommendations',
    position,
    recommendation_type: product.recommendationType,
    product_key: generateProductKey(product),
    product_line: product.cardType,
    product_source: product.productSource.name,
    is_control: isControl,
    user_id: userId,
  });
  return setTimeout(() => { global.open(product.url, '_blank'); }, LINK_TIMEOUT);
};

export const trackRecommendationsViewed = (recommendedProducts, type, isControl, userId) => {
  const viewedProductsList = recommendedProducts.map((product) => ({
    product_key: generateProductKey(product),
    product_line: product.cardType,
    product_source: product.productSource.name,
  }));
  sendTrackEvent(
    eventNames.recommendationsViewed, {
      page: 'authn_recommendations',
      recommendation_type: type,
      products: viewedProductsList,
      is_control: isControl,
      user_id: userId,
    },
  );
};

export const trackRecommendationsGroup = (variation, userId) => {
  sendTrackEvent(
    eventNames.recommendationsGroup, {
      variation,
      page: 'authn_recommendations',
      user_id: userId,
    },
  );
};

export default {
  trackRecommendationClick,
  trackRecommendationsGroup,
  trackRecommendationsViewed,
};
