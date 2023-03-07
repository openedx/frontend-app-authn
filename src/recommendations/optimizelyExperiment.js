import optimizelyInstance from '../data/optimizely';

const RECOMMENDATIONS_EXP_KEY = 'welcome_page_recommendations_exp';
const RECOMMENDATIONS_EXP_VARIATION = 'welcome_page_recommendations_enabled';

export const eventNames = {
  recommendedCourseClicked: 'welcome_page_recommendation_card_click',
  recommendationsViewed: 'welcome_page_recommendations_viewed',
};

/**
  * Activate the post registration recommendations optimizely experiment
  * and return the true if the user is in variation else false.
  * @param  {String} userId  user id of authenticated user.
  * @return {boolean} true if the user is in variation else false
*/
const activateRecommendationsExperiment = (userId) => {
  const variation = optimizelyInstance.activate(
    RECOMMENDATIONS_EXP_KEY,
    userId,
  );
  return variation === RECOMMENDATIONS_EXP_VARIATION;
};

/**
  * Fire an optimizely track event for post registration recommended course card clicked.
  * @param  {String} userId  user id of authenticated user.
  * @param  {Object} userAttributes Dictionary of user attributes (optional).
*/
const trackRecommendationCardClickOptimizely = (userId, userAttributes = {}) => {
  optimizelyInstance.track(eventNames.recommendedCourseClicked, userId, userAttributes);
};

export {
  activateRecommendationsExperiment,
  trackRecommendationCardClickOptimizely,
};
