import { useMutation } from '@tanstack/react-query';

import { patchAccount } from './api';
import {
  COMPLETE_STATE, DEFAULT_STATE,
} from '../../data/constants';
import { useProgressiveProfilingContext } from '../components/ProgressiveProfilingContext';

interface SaveUserProfilePayload {
  username: string;
  data: Record<string, any>;
}

interface UseSaveUserProfileOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const useSaveUserProfile = (options: UseSaveUserProfileOptions = {}) => {
  const { setSuccess, setSubmitState } = useProgressiveProfilingContext();
  return useMutation({
    mutationFn: async ({ username, data }: SaveUserProfilePayload) => (
      patchAccount(username, data)
    ),
    onSuccess: () => {
      setSuccess(true);
      setSubmitState(COMPLETE_STATE);
      if (options.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error: unknown) => {
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
