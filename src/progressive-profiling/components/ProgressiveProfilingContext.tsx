import { createContext, FC, ReactNode, useContext, useMemo, useState, useCallback } from 'react';

import {
  DEFAULT_STATE,
} from '../../data/constants';

interface ProgressiveProfilingContextType {
  isLoading: boolean;
  showError: boolean;
  success: boolean;
  submitState?: string;
  setLoading: (loading: boolean) => void;
  setShowError: (showError: boolean) => void;
  setSuccess: (success: boolean) => void;
  setSubmitState: (state: string) => void;
  clearState: () => void;
}

const ProgressiveProfilingContext = createContext<ProgressiveProfilingContextType | undefined>(undefined);

interface ProgressiveProfilingProviderProps {
  children: ReactNode;
}

export const ProgressiveProfilingProvider: FC<ProgressiveProfilingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitState, setSubmitState] = useState<string>(DEFAULT_STATE);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setShowError(false);
      setSuccess(false);
    }
  }, []);

  const clearState = useCallback(() => {
    setIsLoading(false);
    setShowError(false);
    setSuccess(false);
  }, []);

  const value = useMemo(() => ({
    isLoading,
    showError,
    success,
    setLoading,
    setShowError,
    setSuccess,
    clearState,
    submitState,
    setSubmitState,
  }), [
    isLoading,
    showError,
    success,
    setLoading,
    setShowError,
    setSuccess,
    clearState,
    submitState,
    setSubmitState,
  ]);

  return (
    <ProgressiveProfilingContext.Provider value={value}>
      {children}
    </ProgressiveProfilingContext.Provider>
  );
};

export const useProgressiveProfilingContext = (): ProgressiveProfilingContextType => {
  const context = useContext(ProgressiveProfilingContext);
  if (context === undefined) {
    throw new Error('useProgressiveProfilingContext must be used within a ProgressiveProfilingProvider');
  }
  return context;
};
