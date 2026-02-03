import { createContext, FC, ReactNode, useContext, useMemo, useState, useCallback } from 'react';

interface RegisterContextType {
  validations: any, // todo: check this type
  submitState: string,
  userPipelineDataLoaded: boolean,
  usernameSuggestions: string[],
  validationApiRateLimited: boolean,
  shouldBackupState: boolean,
  registrationError: Record<string, string>,
  registrationFormData: any, // todo: add type
  registrationResult: { success: boolean, redirectUrl: string, authenticatedUser: any },
  backendValidations: Record<string, string> | null,
  backendCountryCode: string,
  setValidationsSuccess: (validations: any) => void,
  setValidationsFailure: () => void,
  clearUsernameSuggestions: () => void,
  clearRegistrationBackendError: (field: string) => void,
  updateRegistrationFormData: (newData: any) => void,
  setRegistrationResult: (result: { success: boolean, redirectUrl: string, authenticatedUser: any }) => void,
  setBackendCountryCode: (countryCode: string) => void,
}

const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

interface RegisterProviderProps {
  children: ReactNode;
}

export const RegisterProvider: FC<RegisterProviderProps> = ({ children }) => {
  const [validations, setValidations] = useState(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [validationApiRateLimited, setValidationApiRateLimited] = useState(false);
  const [registrationError, setRegistrationError] = useState<Record<string, string>>({});
  const [registrationResult, setRegistrationResult] = useState({ success: false, redirectUrl: '', authenticatedUser: null });
  const [backendCountryCode, setBackendCountryCodeState] = useState('');
  const [registrationFormData, setRegistrationFormData] = useState<any>({
    configurableFormFields: {
      marketingEmailsOptIn: true,
    },
    formFields: {
      name: '', email: '', username: '', password: '',
    },
    emailSuggestion: {
      suggestion: '', type: '',
    },
    errors: {
      name: '', email: '', username: '', password: '',
    },
  }); // todo: add type
  const [submitState] = useState('default'); // todo: manage submit state
  const [userPipelineDataLoaded, setUserPipelineDataLoaded] = useState(false); // todo: manage pipeline data
  const [shouldBackupState] = useState(false); // todo: manage backup state

  // Function to handle successful validation - mirrors REGISTER_FORM_VALIDATIONS.SUCCESS
  const setValidationsSuccess = useCallback((validations: any) => {
    const { usernameSuggestions: newUsernameSuggestions, ...validationWithoutUsernameSuggestions } = validations;
    setValidations(validationWithoutUsernameSuggestions);
    setUsernameSuggestions(prev => newUsernameSuggestions || prev);
    setValidationApiRateLimited(false);
  }, []);

  // Function to handle validation failure - mirrors REGISTER_FORM_VALIDATIONS.FAILURE
  const setValidationsFailure = useCallback(() => {
    setValidationApiRateLimited(true);
    setValidations(null);
  }, []);

  const clearUsernameSuggestions = useCallback(() => {
    setUsernameSuggestions([]);
  }, []);

  const clearRegistrationBackendError = useCallback((field: string) => {
    setRegistrationError(prevErrors => {
      const { [field]: _, ...rest } = prevErrors;
      return rest;
    });
  }, []);

  const setBackendCountryCode = useCallback((countryCode: string) => {
    // Only set backend country code if configurableFormFields.country doesn't exist
    // This mirrors the logic in the Redux reducer
    if (!registrationFormData.configurableFormFields.country) {
      setBackendCountryCodeState(countryCode);
    }
  }, [registrationFormData.configurableFormFields.country]);



  const setEmailSuggestionContext = useCallback((suggestion: string, type: string) => {
    setRegistrationFormData((prevData: any) => ({
      ...prevData,
      emailSuggestion: { suggestion, type },
    }));
  }, []);

  // Function to update registration form data for persistence across tab switches
  const updateRegistrationFormData = useCallback((newData: any) => {
    setRegistrationFormData((prevData: any) => ({
      ...prevData,
      ...newData,
    }));
  }, []);

  // Process backend validation errors - equivalent to getBackendValidations selector
  const backendValidations = useMemo(() => {
    if (validations) {
      return validations.validationDecisions;
    }

    if (registrationError && Object.keys(registrationError).length > 0) {
      const fields = Object.keys(registrationError).filter(
        (fieldName) => !(['errorCode', 'usernameSuggestions'].includes(fieldName)),
      );

      const validationDecisions: Record<string, string> = {};
      fields.forEach(field => {
        validationDecisions[field] = registrationError[field]?.[0]?.userMessage || '';
      });
      return validationDecisions;
    }

    return null;
  }, [validations, registrationError]);

  const value = useMemo(() => ({
    validations,
    submitState,
    userPipelineDataLoaded,
    setUserPipelineDataLoaded,
    usernameSuggestions,
    validationApiRateLimited,
    shouldBackupState,
    setValidationsSuccess,
    setValidationsFailure,
    clearUsernameSuggestions,
    clearRegistrationBackendError,
    registrationFormData,
    registrationResult,
    registrationError,
    backendValidations,
    backendCountryCode,
    setRegistrationFormData,
    setEmailSuggestionContext,
    updateRegistrationFormData,
    setRegistrationResult,
    setBackendCountryCode,
    setRegistrationError,
  }), [
    validations,
    submitState,
    userPipelineDataLoaded,
    setUserPipelineDataLoaded,
    usernameSuggestions,
    validationApiRateLimited,
    shouldBackupState,
    setValidationsSuccess,
    setValidationsFailure,
    clearUsernameSuggestions,
    clearRegistrationBackendError,
    registrationFormData,
    registrationResult,
    registrationError,
    backendValidations,
    backendCountryCode,
    setRegistrationFormData,
    setEmailSuggestionContext,
    updateRegistrationFormData,
    setRegistrationResult,
    setBackendCountryCode,
    setRegistrationError,
  ]);

  return (
    <RegisterContext.Provider value={value}>
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegisterContext = (): RegisterContextType => {
  const context = useContext(RegisterContext);
  if (context === undefined) {
    throw new Error('useRegisterContext must be used within a RegisterProvider');
  }
  return context;
};
