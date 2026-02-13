import {
  createContext, FC, ReactNode, useCallback, useContext, useMemo, useReducer,
} from 'react';

import {
  RegisterContextType, RegisterState, RegistrationFormData, ValidationData,
} from '../types';

const RegisterContext = createContext<RegisterContextType | null>(null);

const initialState: RegisterState = {
  validations: null,
  usernameSuggestions: [],
  validationApiRateLimited: false,
  registrationError: {},
  backendCountryCode: '',
  registrationFormData: {
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
  },
};

const registerReducer = (state: RegisterState, action: any): RegisterState => {
  switch (action.type) {
    case 'SET_VALIDATIONS_SUCCESS': {
      const { usernameSuggestions: newUsernameSuggestions, ...validationWithoutUsernameSuggestions } = action.payload;
      return {
        ...state,
        validations: validationWithoutUsernameSuggestions,
        usernameSuggestions: newUsernameSuggestions || state.usernameSuggestions,
        validationApiRateLimited: false,
      };
    }
    case 'SET_VALIDATIONS_FAILURE':
      return {
        ...state,
        validationApiRateLimited: true,
        validations: null,
      };
    case 'CLEAR_USERNAME_SUGGESTIONS':
      return { ...state, usernameSuggestions: [] };
    case 'CLEAR_REGISTRATION_BACKEND_ERROR': {
      const { [action.payload]: removedField, ...rest } = state.registrationError;
      return { ...state, registrationError: rest };
    }
    case 'SET_BACKEND_COUNTRY_CODE':
      return {
        ...state,
        backendCountryCode: !state.registrationFormData.configurableFormFields.country
          ? action.payload
          : state.backendCountryCode,
      };
    case 'SET_EMAIL_SUGGESTION':
      return {
        ...state,
        registrationFormData: {
          ...state.registrationFormData,
          emailSuggestion: { suggestion: action.payload.suggestion, type: action.payload.type },
        },
      };
    case 'UPDATE_REGISTRATION_FORM_DATA':
      return {
        ...state,
        registrationFormData: { ...state.registrationFormData, ...action.payload },
      };
    case 'SET_REGISTRATION_FORM_DATA':
      return {
        ...state,
        registrationFormData: typeof action.payload === 'function'
          ? action.payload(state.registrationFormData)
          : action.payload,
      };
    case 'SET_REGISTRATION_ERROR':
      return { ...state, registrationError: action.payload };
    default:
      return state;
  }
};

interface RegisterProviderProps {
  children: ReactNode;
}

export const RegisterProvider: FC<RegisterProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(registerReducer, initialState);

  const setValidationsSuccess = useCallback((validationData: ValidationData) => {
    dispatch({ type: 'SET_VALIDATIONS_SUCCESS', payload: validationData });
  }, []);

  const setValidationsFailure = useCallback(() => {
    dispatch({ type: 'SET_VALIDATIONS_FAILURE' });
  }, []);

  const clearUsernameSuggestions = useCallback(() => {
    dispatch({ type: 'CLEAR_USERNAME_SUGGESTIONS' });
  }, []);

  const clearRegistrationBackendError = useCallback((field: string) => {
    dispatch({ type: 'CLEAR_REGISTRATION_BACKEND_ERROR', payload: field });
  }, []);

  const setBackendCountryCode = useCallback((countryCode: string) => {
    dispatch({ type: 'SET_BACKEND_COUNTRY_CODE', payload: countryCode });
  }, []);

  const setEmailSuggestionContext = useCallback((suggestion: string, type: string) => {
    dispatch({ type: 'SET_EMAIL_SUGGESTION', payload: { suggestion, type } });
  }, []);

  const updateRegistrationFormData = useCallback((newData: Partial<RegistrationFormData>) => {
    dispatch({ type: 'UPDATE_REGISTRATION_FORM_DATA', payload: newData });
  }, []);

  const setRegistrationFormData = useCallback((data: RegistrationFormData |
  ((prev: RegistrationFormData) => RegistrationFormData)) => {
    dispatch({ type: 'SET_REGISTRATION_FORM_DATA', payload: data });
  }, []);

  const setRegistrationError = useCallback((error: Record<string, Array<{ userMessage: string }>>) => {
    dispatch({ type: 'SET_REGISTRATION_ERROR', payload: error });
  }, []);

  const backendValidations = useMemo(() => {
    if (state.validations) {
      return state.validations.validationDecisions;
    }

    if (state.registrationError && Object.keys(state.registrationError).length > 0) {
      const fields = Object.keys(state.registrationError).filter(
        (fieldName) => !(['errorCode', 'usernameSuggestions'].includes(fieldName)),
      );

      const validationDecisions: Record<string, string> = {};
      fields.forEach(field => {
        validationDecisions[field] = state.registrationError[field]?.[0]?.userMessage || '';
      });
      return validationDecisions;
    }

    return null;
  }, [state.validations, state.registrationError]);

  const contextValue = useMemo(() => ({
    validations: state.validations,
    registrationFormData: state.registrationFormData,
    registrationError: state.registrationError,
    backendCountryCode: state.backendCountryCode,
    usernameSuggestions: state.usernameSuggestions,
    validationApiRateLimited: state.validationApiRateLimited,
    backendValidations,
    setValidationsSuccess,
    setValidationsFailure,
    clearUsernameSuggestions,
    clearRegistrationBackendError,
    setRegistrationFormData,
    setEmailSuggestionContext,
    updateRegistrationFormData,
    setBackendCountryCode,
    setRegistrationError,

  }), [
    state.validations,
    state.registrationFormData,
    state.backendCountryCode,
    state.usernameSuggestions,
    state.validationApiRateLimited,
    state.registrationError,
    backendValidations,
    setValidationsSuccess,
    setValidationsFailure,
    clearUsernameSuggestions,
    clearRegistrationBackendError,
    setRegistrationFormData,
    setEmailSuggestionContext,
    updateRegistrationFormData,
    setBackendCountryCode,
    setRegistrationError,
  ]);

  return (
    <RegisterContext.Provider value={contextValue}>
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegisterContext = () => {
  const context = useContext(RegisterContext);
  if (!context) {
    throw new Error('useRegisterContext must be used within a RegisterProvider');
  }
  return context;
};
