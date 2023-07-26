import optimizelyInstance from '../data/optimizely';

const RECOMMENDATIONS_EXP_KEY = 'popular_and_trending_recommendations_exp';
const RECOMMENDATIONS_EXP_VARIATION = 'popular_and_trending_recommendations';

export const eventNames = {
  recommendedCourseClicked: 'welcome_page_recommendation_card_click',
  recommendationsViewed: 'welcome_page_recommendations_viewed',
};

/**
  * Activate the post registration recommendations optimizely experiment
  * and return the true if the user is in variation else false.
  * @param  {String} userId  user id of authenticated user.
  * @return {string} variation the user belong in
*/
const activateRecommendationsExperiment = (userId) => optimizelyInstance?.activate(RECOMMENDATIONS_EXP_KEY, userId);

/**
  * Fire an optimizely track event for post registration recommended course card clicked.
  * @param  {String} userId  user id of authenticated user.
  * @param  {Object} userAttributes Dictionary of user attributes (optional).
*/
const trackRecommendationCardClickOptimizely = (userId, userAttributes = {}) => {
  optimizelyInstance?.track(eventNames.recommendedCourseClicked, userId, userAttributes);
};

/**
  * Fire an optimizely track event for post registration recommendation viewed.
  * @param  {String} userId  user id of authenticated user.
  * @param  {Object} userAttributes Dictionary of user attributes (optional).
*/
const trackRecommendationViewedOptimizely = (userId, userAttributes = {}) => {
  optimizelyInstance?.track(eventNames.recommendationsViewed, userId, userAttributes);
};

export {
  RECOMMENDATIONS_EXP_VARIATION,
  activateRecommendationsExperiment,
  trackRecommendationCardClickOptimizely,
  trackRecommendationViewedOptimizely,
};
