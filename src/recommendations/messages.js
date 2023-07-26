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
    defaultMessage: 'Trending Courses',
    description: 'Trending courses option',
  },
  'recommendation.option.popular': {
    id: 'recommendation.option.popular',
    defaultMessage: 'Popular Courses',
    description: 'Popular courses option',
  },
});

export const cardBadgesMessages = defineMessages({
  'recommendation.2u-product-card.pill-text.course': {
    id: 'recommendation.2u-product-card.pill-text.course',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'Course',
  },
  'recommendation.2u-product-card.pill-text.microbachelors': {
    id: 'recommendation.2u-product-card.pill-text.microbachelors',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'MicroBachelors®',
  },
  'recommendation.2u-product-card.pill-text.micromasters': {
    id: 'recommendation.2u-product-card.pill-text.micromasters',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'MicroMasters®',
  },
  'recommendation.2u-product-card.pill-text.xseries': {
    id: 'recommendation.2u-product-card.pill-text.xseries',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'XSeries',
  },
  'recommendation.2u-product-card.pill-text.professional-certificate': {
    id: 'recommendation.2u-product-card.pill-text.professional-certificate',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'Professional Certificate',
  },
  // 2U Products
  'recommendation.2u-product-card.pill-text.executive-education': {
    id: 'recommendation.2u-product-card.pill-text.executive-education',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'Executive Education',
  },
  'recommendation.2u-product-card.pill-text.boot-camp': {
    id: 'recommendation.2u-product-card.pill-text.boot-camp',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'Boot Camp',
  },
  'recommendation.2u-product-card.pill-text.bachelors': {
    id: 'recommendation.2u-product-card.pill-text.bachelors',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'Bachelor\'s Degree',
  },
  'recommendation.2u-product-card.pill-text.masters': {
    id: 'recommendation.2u-product-card.pill-text.masters',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'Master\'s Degree',
  },
  'recommendation.2u-product-card.pill-text.doctorate': {
    id: 'recommendation.2u-product-card.pill-text.doctorate',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'Doctoral Program',
  },
  'recommendation.2u-product-card.pill-text.certificate': {
    id: 'recommendation.2u-product-card.pill-text.certificate',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'Certificate Program',
  },
  'recommendation.2u-product-card.pill-text.license': {
    id: 'recommendation.2u-product-card.pill-text.license',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'Licensure Program',
  },
});

export const cardFooterMessages = defineMessages({
  'recommendation.2u-product-card.footer-text.emeritus': {
    id: 'recommendation.2u-product-card.pill-text.emeritus',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'Offered on Emeritus',
  },
  'recommendation.2u-product-card.footer-text.shorelight': {
    id: 'recommendation.2u-product-card.pill-text.shorelight',
    description: 'Text on a product card that describes which product line this item belongs to',
    defaultMessage: 'Offered through Shorelight',
  },
  'recommendation.2u-product-card.footer-text.number-of-courses': {
    id: 'recommendation.2u-product-card.footer-text.number-of-courses',
    description: 'Label in card footer that shows how many courses are in a program',
    defaultMessage: '{length} {label}',
  },
  'recommendation.2u-product-card.footer-text.subscription': {
    id: 'recommendation.2u-product-card.footer-text.subscription',
    description: 'Label in card footer that describes that it is a subscription program',
    defaultMessage: 'Subscription',
  },
});

export const externalLinkIconMessages = defineMessages({
  'recommendation.2u-product-card.launch-icon.sr-text': {
    id: 'recommendation.2u-product-card.launch-icon.sr-text',
    description: 'Screen reader text for the launch icon on the cards',
    defaultMessage: 'Opens a link in a new tab',
  },
});

export default messages;
