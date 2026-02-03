import { useMutation } from '@tanstack/react-query';
import { patchAccount } from './api';
import { useProgressiveProfilingContext } from '../components/ProgressiveProfilingContext';
import {
  DEFAULT_STATE, PENDING_STATE,
} from '../../data/constants';


interface SaveUserProfilePayload {
  username: string;
  data: Record<string, any>;
}

interface UseSaveUserProfileOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

const useSaveUserProfile = (options: UseSaveUserProfileOptions = {}) => {
  const { setLoading, setError, setSuccess, setSubmitState } = useProgressiveProfilingContext();
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
      setSubmitState(DEFAULT_STATE);
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      // Set error state (equivalent to saveUserProfileFailure)
      setLoading(false);
      setError(error instanceof Error ? error.message : 'An error occurred while saving profile');
      setSubmitState(PENDING_STATE);
      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

export {
  useSaveUserProfile,
};
