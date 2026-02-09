import {
  createContext, FC, ReactNode, useCallback, useContext, useMemo, useState,
} from 'react';

import { DEFAULT_STATE } from '../../data/constants';

export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  name: string;
}

export interface EmailSuggestion {
  suggestion: string;
  type: string;
}

export interface RegistrationFormData {
  configurableFormFields: {
    marketingEmailsOptIn: boolean;
    country?: string;
    [key: string]: any;
  };
  formFields: {
    name: string;
    email: string;
    username: string;
    password: string;
  };
  emailSuggestion: EmailSuggestion;
  errors: {
    name: string;
    email: string;
    username: string;
    password: string;
  };
}

export interface RegistrationResult {
  success: boolean;
  redirectUrl: string;
  authenticatedUser: AuthenticatedUser | null;
}

export interface ValidationData {
  validationDecisions: Record<string, string>;
  usernameSuggestions?: string[];
}

export interface RegisterContextType {
  validations: ValidationData | null;
  submitState: string;
  userPipelineDataLoaded: boolean;
  setUserPipelineDataLoaded: (loaded: boolean) => void;
  usernameSuggestions: string[];
  validationApiRateLimited: boolean;
  shouldBackupState: boolean;
  registrationError: Record<string, Array<{ userMessage: string }>>;
  registrationFormData: RegistrationFormData;
  registrationResult: RegistrationResult;
  backendValidations: Record<string, string> | null;
  backendCountryCode: string;
  setValidationsSuccess: (validationData: ValidationData) => void;
  setValidationsFailure: () => void;
  clearUsernameSuggestions: () => void;
  clearRegistrationBackendError: (field: string) => void;
  updateRegistrationFormData: (newData: Partial<RegistrationFormData>) => void;
  setRegistrationResult: (result: RegistrationResult) => void;
  setBackendCountryCode: (countryCode: string) => void;
  setRegistrationFormData: (data: RegistrationFormData |
  ((prev: RegistrationFormData) => RegistrationFormData)) => void;
  setEmailSuggestionContext: (suggestion: string, type: string) => void;
  setRegistrationError: (error: Record<string, Array<{ userMessage: string }>>) => void;
}

const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

interface RegisterProviderProps {
  children: ReactNode;
}

export const RegisterProvider: FC<RegisterProviderProps> = ({ children }) => {
  const [validations, setValidations] = useState<ValidationData | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [validationApiRateLimited, setValidationApiRateLimited] = useState(false);
  const [registrationError, setRegistrationError] = useState<Record<string, Array<{ userMessage: string }>>>({});
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult>({ success: false, redirectUrl: '', authenticatedUser: null });
  const [backendCountryCode, setBackendCountryCodeState] = useState('');
  const [registrationFormData, setRegistrationFormData] = useState<RegistrationFormData>({
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
  });
  const [submitState] = useState(DEFAULT_STATE);
  const [userPipelineDataLoaded, setUserPipelineDataLoaded] = useState(false);
  const [shouldBackupState] = useState(false);

  // Function to handle successful validation - mirrors REGISTER_FORM_VALIDATIONS.SUCCESS
  const setValidationsSuccess = useCallback((validationData: ValidationData) => {
    const { usernameSuggestions: newUsernameSuggestions, ...validationWithoutUsernameSuggestions } = validationData;
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
      const { [field]: removedField, ...rest } = prevErrors;
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
    setRegistrationFormData((prevData: RegistrationFormData) => ({
      ...prevData,
      emailSuggestion: { suggestion, type },
    }));
  }, []);

  // Function to update registration form data for persistence across tab switches
  const updateRegistrationFormData = useCallback((newData: Partial<RegistrationFormData>) => {
    setRegistrationFormData((prevData: RegistrationFormData) => ({
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
