const RECOMMENDATIONS_EXP_ID = process.env.RECOMMENDATIONS_EXPERIMENT_ID;
const RECOMMENDATIONS_EXP_VARIATION = 'show_recommendations_page';

const activateRecommendationsExperiment = () => {
  if (window.optimizely) {
    window.optimizely.push({
      type: 'page',
      pageName: 'van_1294_personalized_recommendations_on_authn',
    });
  }
};

const isUserInVariation = () => {
  if (window.optimizely) {
    const selectedVariant = window.optimizely.get('state').getVariationMap()[RECOMMENDATIONS_EXP_ID];
    return selectedVariant?.name === RECOMMENDATIONS_EXP_VARIATION;
  }
  return false;
};

export { activateRecommendationsExperiment, isUserInVariation };
