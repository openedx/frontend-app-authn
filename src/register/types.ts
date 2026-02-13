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
  usernameSuggestions: string[];
  validationApiRateLimited: boolean;
  registrationError: Record<string, Array<{ userMessage: string }>>;
  registrationFormData: RegistrationFormData;
  backendValidations: Record<string, string> | null;
  backendCountryCode: string;
  setValidationsSuccess: (validationData: ValidationData) => void;
  setValidationsFailure: () => void;
  clearUsernameSuggestions: () => void;
  clearRegistrationBackendError: (field: string) => void;
  updateRegistrationFormData: (newData: Partial<RegistrationFormData>) => void;
  setBackendCountryCode: (countryCode: string) => void;
  setRegistrationFormData: (data: RegistrationFormData |
  ((prev: RegistrationFormData) => RegistrationFormData)) => void;
  setEmailSuggestionContext: (suggestion: string, type: string) => void;
  setRegistrationError: (error: Record<string, Array<{ userMessage: string }>>) => void;
}

export interface RegisterState {
  validations: ValidationData | null;
  usernameSuggestions: string[];
  validationApiRateLimited: boolean;
  registrationError: Record<string, Array<{ userMessage: string }>>;
  backendCountryCode: string;
  registrationFormData: RegistrationFormData;
}
