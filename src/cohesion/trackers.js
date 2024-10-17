import { EVENT_TYPES } from './constants';

/**
 * Tracks cohesion events by setting the page type and tracking a click event.
 *
 * @param {string} pageType - The type of page where the event occurred.
 * @param {string} elementType - The type of the web element (e.g., 'BUTTON', 'LINK').
 * @param {string} webElementText - The text content of the web element.
 * @param {string} webElementName - The name of the web element.
 */
const trackCohesionEvent = (eventData) => {
  window.chsn_pageType = eventData.pageType;
  const webElement = {
    elementType: eventData.elementType,
    text: eventData.webElementText,
    name: eventData.webElementName,
  };
  window.tagular('beam', {
    '@type': EVENT_TYPES.ElementClicked,
    webElement,
  });
};

export default trackCohesionEvent;
