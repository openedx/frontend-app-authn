import { EVENT_TYPES } from '../constants';

/**
 * Creates a web element object for cohesion tracking purposes.
 *
 * @param {string} elementType - The type of the web element (e.g., 'BUTTON', 'LINK').
 * @param {string} webElementText - The text content of the web element.
 * @param {string} webElementName - The name of the web element.
 * @returns {Object} An object representing the web element.
 */

export const createWebElement = (elementType, webElementName, webElementText) => ({
  elementType,
  text: webElementText,
  name: webElementName,
});

export const trackEvent = (eventType, webElement) => {
  window.tagular('beam', {
    '@type': eventType,
    webElement,
  });
};

/**
 * Tracks cohesion events by setting the page type and tracking a click event.
 *
 * @param {string} pageType - The type of page where the event occurred.
 * @param {string} elementType - The type of the web element (e.g., 'BUTTON', 'LINK').
 * @param {string} webElementText - The text content of the web element.
 * @param {string} webElementName - The name of the web element.
 */
export const createCohesionEvent = (pageType, elementType, webElementName, webElementText) => {
  window.chsn_pageType = pageType;
  const webElement = createWebElement(elementType, webElementName, webElementText);
  trackEvent(EVENT_TYPES.ElementClicked, webElement);
};
