import { createContext, FC, ReactNode, useContext, useMemo, useState, useCallback } from 'react';

interface ThirdPartyAuthContextType {
  fieldDescriptions: any;
  optionalFields: {
    fields: any;
    extended_profile: any[];
  };
  thirdPartyAuthApiStatus: string | null;
  thirdPartyAuthContext: {
    autoSubmitRegForm: boolean;
    currentProvider: string | null;
    finishAuthUrl: string | null;
    countryCode: string | null;
    providers: any[];
    secondaryProviders: any[];
    pipelineUserDetails: any | null;
    errorMessage: string | null;
    welcomePageRedirectUrl: string | null;
  };
  setThirdPartyAuthContextBegin: () => void;
  setThirdPartyAuthContextSuccess: (fieldDescriptions: any, optionalFields: any, thirdPartyAuthContext: any) => void;
  setThirdPartyAuthContextFailure: () => void;
  clearThirdPartyAuthErrorMessage: () => void;
}

const ThirdPartyAuthContext = createContext<ThirdPartyAuthContextType | undefined>(undefined);

interface ThirdPartyAuthProviderProps {
  children: ReactNode;
}

export const ThirdPartyAuthProvider: FC<ThirdPartyAuthProviderProps> = ({ children }) => {
  const [fieldDescriptions, setFieldDescriptions] = useState({});
  const [optionalFields, setOptionalFields] = useState({
    fields: {},
    extended_profile: [],
  });
  const [thirdPartyAuthApiStatus, setThirdPartyAuthApiStatus] = useState<string | null>(null);
  const [thirdPartyAuthContext, setThirdPartyAuthContext] = useState({
    autoSubmitRegForm: false,
    currentProvider: null,
    finishAuthUrl: null,
    countryCode: null,
    providers: [],
    secondaryProviders: [],
    pipelineUserDetails: null,
    errorMessage: null,
    welcomePageRedirectUrl: null,
  });

  // Function to handle begin state - mirrors THIRD_PARTY_AUTH_CONTEXT.BEGIN
  const setThirdPartyAuthContextBegin = useCallback(() => {
    setThirdPartyAuthApiStatus('pending'); // todo: use enum
  }, []);

  // Function to handle success - mirrors THIRD_PARTY_AUTH_CONTEXT.SUCCESS
  const setThirdPartyAuthContextSuccess = useCallback((fieldDescriptions: any, optionalFields: any, thirdPartyAuthContext: any) => {
    setFieldDescriptions(fieldDescriptions?.fields || {});
    setOptionalFields(optionalFields || { fields: {}, extended_profile: [] });
    setThirdPartyAuthContext(thirdPartyAuthContext || {
      autoSubmitRegForm: false,
      currentProvider: null,
      finishAuthUrl: null,
      countryCode: null,
      providers: [],
      secondaryProviders: [],
      pipelineUserDetails: null,
      errorMessage: null,
      welcomePageRedirectUrl: null,
    });
    setThirdPartyAuthApiStatus('complete');
  }, []);

  // Function to handle failure - mirrors THIRD_PARTY_AUTH_CONTEXT.FAILURE
  const setThirdPartyAuthContextFailure = useCallback(() => {
    setThirdPartyAuthApiStatus('failure');
    setThirdPartyAuthContext(prev => ({
      ...prev,
      errorMessage: null,
    }));
  }, []);

  // Function to clear error message - mirrors THIRD_PARTY_AUTH_CONTEXT_CLEAR_ERROR_MSG
  const clearThirdPartyAuthErrorMessage = useCallback(() => {
    setThirdPartyAuthApiStatus('pending');
    setThirdPartyAuthContext(prev => ({
      ...prev,
      errorMessage: null,
    }));
  }, []);

  const value = useMemo(() => ({
    fieldDescriptions,
    optionalFields,
    thirdPartyAuthApiStatus,
    thirdPartyAuthContext,
    setThirdPartyAuthContextBegin,
    setThirdPartyAuthContextSuccess,
    setThirdPartyAuthContextFailure,
    clearThirdPartyAuthErrorMessage,
  }), [
    fieldDescriptions,
    optionalFields,
    thirdPartyAuthApiStatus,
    thirdPartyAuthContext,
    setThirdPartyAuthContextBegin,
    setThirdPartyAuthContextSuccess,
    setThirdPartyAuthContextFailure,
    clearThirdPartyAuthErrorMessage,
  ]);

  return (
    <ThirdPartyAuthContext.Provider value={value}>
      {children}
    </ThirdPartyAuthContext.Provider>
  );
};

export const useThirdPartyAuthContext = (): ThirdPartyAuthContextType => {
  const context = useContext(ThirdPartyAuthContext);
  if (context === undefined) {
    throw new Error('useThirdPartyAuthContext must be used within a ThirdPartyAuthProvider');
  }
  return context;
};
