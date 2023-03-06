import { sendTrackEvent } from '@edx/frontend-platform/analytics';

export const LINK_TIMEOUT = 300;

export const eventNames = {
  recommendedCourseClicked: 'edx.bi.user.recommended.course.click',
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

export const trackRecommendationsClicked = (courseKey, isControl, position, userId, href, recommendationType) => {
  createLinkTracker(
    sendTrackEvent(eventNames.recommendedCourseClicked, {
      page: 'authn_recommendations',
      position,
      recommendation_type: recommendationType,
      course_key: courseKey,
      is_control: isControl,
      user_id: userId,
    }),
    href,
    true,
  );
};

export const trackRecommendationsViewed = (recommendedCourseKeys, isControl, userId) => {
  sendTrackEvent(
    eventNames.recommendationsViewed, {
      page: 'authn_recommendations',
      course_key_array: recommendedCourseKeys,
      amplitude_recommendations: false,
      is_control: isControl,
      user_id: userId,
    },
  );
};

export default {
  trackRecommendationsClicked,
  trackRecommendationsViewed,
};
