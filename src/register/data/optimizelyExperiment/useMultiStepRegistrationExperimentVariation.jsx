import { useEffect, useState } from 'react';

import {
  activateMultiStepRegistrationExperiment,
  getMultiStepRegistrationExperimentVariation,
  NOT_INITIALIZED,
} from './helper';
import { COMPLETE_STATE } from '../../../data/constants';

/**
 * This hook returns activates multi step registration experiment and returns the experiment
 * variation for the user.
 */
const useMultiStepRegistrationExperimentVariation = (
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
      const expVariation = getMultiStepRegistrationExperimentVariation();
      if (expVariation) {
        setVariation(expVariation);
      } else {
        // This is to handle the case when user dont get variation for some reason, the register page
        // shows unlimited spinner.
        setVariation(NOT_INITIALIZED);
      }
    };

    activateMultiStepRegistrationExperiment();

    const timer = setTimeout(getVariation, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [ // eslint-disable-line react-hooks/exhaustive-deps
    currentProvider, initExpVariation, registrationEmbedded, thirdPartyAuthApiStatus, tpaHint,
  ]);

  return variation;
};

export default useMultiStepRegistrationExperimentVariation;
