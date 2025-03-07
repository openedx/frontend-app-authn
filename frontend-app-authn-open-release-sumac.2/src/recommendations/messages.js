import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'recommendation.page.title': {
    id: 'recommendation.page.title',
    defaultMessage: 'Recommendations | {siteName}',
    description: 'recommendation page title',
  },
  'recommendation.page.heading': {
    id: 'recommendation.page.heading',
    defaultMessage: 'We have a few recommendations to get you started.',
    description: 'recommendation page heading',
  },
  'recommendation.skip.button': {
    id: 'recommendation.skip.button',
    defaultMessage: 'Skip for now',
    description: 'Skip button text',
  },
  'recommendation.option.trending': {
    id: 'recommendation.option.trending',
    defaultMessage: 'Trending Now',
    description: 'Title for trending products',
  },
  'recommendation.option.popular': {
    id: 'recommendation.option.popular',
    defaultMessage: 'Most Popular',
    description: 'Title for popular products',
  },
  'recommendation.option.recommended.for.you': {
    id: 'recommendation.option.recommended.for.you',
    defaultMessage: 'Recommended For You',
    description: 'Title for personalized products',
  },
});

export const cardBadgesMessages = defineMessages({
  'recommendation.product-card.pill-text.course': {
    id: 'recommendation.product-card.pill-text.course',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'Course',
  },
  'recommendation.product-card.pill-text.professional-certificate': {
    id: 'recommendation.product-card.pill-text.professional-certificate',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'Professional Certificate',
  },
});

export const cardFooterMessages = defineMessages({
  'recommendation.product-card.footer-text.emeritus': {
    id: 'recommendation.product-card.pill-text.emeritus',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'Offered on Emeritus',
  },
  'recommendation.product-card.footer-text.shorelight': {
    id: 'recommendation.product-card.pill-text.shorelight',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'Offered through Shorelight',
  },
  'recommendation.product-card.footer-text.number-of-courses': {
    id: 'recommendation.product-card.footer-text.number-of-courses',
    description: 'Label in card footer that shows how many courses are in a program',
    defaultMessage: '{length} {label}',
  },
  'recommendation.product-card.footer-text.subscription': {
    id: 'recommendation.product-card.footer-text.subscription',
    description: 'Label in card footer that describes that it is a subscription program',
    defaultMessage: 'Subscription',
  },
});

export const externalLinkIconMessages = defineMessages({
  'recommendation.product-card.launch-icon.sr-text': {
    id: 'recommendation.product-card.launch-icon.sr-text',
    description: 'Screen reader text for the launch icon on the cards',
    defaultMessage: 'Opens a link in a new tab',
  },
});

export default messages;
