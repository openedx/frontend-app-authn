import { useMutation } from '@tanstack/react-query';

import { patchAccount } from './api';
import {
  DEFAULT_STATE, COMPLETE_STATE,
} from '../../data/constants';
import { useProgressiveProfilingContext } from '../components/ProgressiveProfilingContext';

interface SaveUserProfilePayload {
  username: string;
  data: Record<string, any>;
}

interface UseSaveUserProfileOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

const useSaveUserProfile = (options: UseSaveUserProfileOptions = {}) => {
  const { setLoading, setSuccess, setSubmitState } = useProgressiveProfilingContext();
  return useMutation({
    mutationFn: async ({ username, data }: SaveUserProfilePayload) => {
      return await patchAccount(username, data);
    },
    onMutate: () => {
      // Set loading state when mutation starts (equivalent to saveUserProfileBegin)
      setLoading(true);
    },
    onSuccess: (data) => {
      // Set success state (equivalent to saveUserProfileSuccess)
      setLoading(false);
      setSuccess(true);
      setSubmitState(COMPLETE_STATE);
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      // Set error state (equivalent to saveUserProfileFailure)
      setLoading(false);
      setSubmitState(DEFAULT_STATE);
      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

export {
  useSaveUserProfile,
};
