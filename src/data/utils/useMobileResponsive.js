import { useEffect, useState } from 'react';

import { breakpoints } from '@openedx/paragon';

/**
 * A react hook used to determine if the current window is mobile or not.
 * returns true if the window is of mobile size.
 * Code source: https://github.com/edx/prospectus/blob/master/src/utils/useMobileResponsive.js
 */
const useMobileResponsive = (breakpoint) => {
  const [isMobileWindow, setIsMobileWindow] = useState();
  const checkForMobile = () => {
    setIsMobileWindow(window.matchMedia(`(max-width: ${breakpoint || breakpoints.small.maxWidth}px)`).matches);
  };
  useEffect(() => {
    checkForMobile();
    window.addEventListener('resize', checkForMobile);
    // return this function here to clean up the event listener
    return () => window.removeEventListener('resize', checkForMobile);
  });
  return isMobileWindow;
};

export default useMobileResponsive;
