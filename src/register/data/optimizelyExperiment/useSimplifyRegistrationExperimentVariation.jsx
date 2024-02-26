import { useEffect, useState } from 'react';

import {
  activateSimplifyRegistrationExperiment,
  DEFAULT_VARIATION,
  getSimplifyRegistrationExperimentVariation,
} from './helper';
import { trackSimplifyRegistrationFirstStepViewed } from './track';
import { COMPLETE_STATE } from '../../../data/constants';

/**
 * This hook returns activates simplify registration experiment and returns the experiment
 * variation for the user.
 */
const useSimplifyRegistrationExperimentVariation = (
  initExpVariation,
  registrationEmbedded,
  tpaHint,
  currentProvider,
  thirdPartyAuthApiStatus,
) => {
  const [variation, setVariation] = useState(initExpVariation);

  useEffect(() => {
    if (initExpVariation || registrationEmbedded || !!tpaHint || !!currentProvider
        || thirdPartyAuthApiStatus !== COMPLETE_STATE) {
      return variation;
    }

    const getVariation = () => {
      const expVariation = getSimplifyRegistrationExperimentVariation();
      if (expVariation) {
        setVariation(expVariation);
        trackSimplifyRegistrationFirstStepViewed(expVariation);
      } else {
        // This is to handle the case when user dont get variation for some reason, the register page
        // shows unlimited spinner.
        setVariation(DEFAULT_VARIATION);
      }
    };

    activateSimplifyRegistrationExperiment();

    const timer = setTimeout(getVariation, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [currentProvider, initExpVariation, registrationEmbedded, thirdPartyAuthApiStatus, tpaHint, variation]);

  return variation;
};

export default useSimplifyRegistrationExperimentVariation;
