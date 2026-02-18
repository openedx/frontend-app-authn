import {
  createContext, FC, ReactNode, useContext, useMemo, useState,
} from 'react';

export interface FormFields {
  emailOrUsername: string;
  password: string;
}

export interface FormErrors {
  emailOrUsername: string;
  password: string;
}

interface LoginContextType {
  formFields: FormFields;
  setFormFields: (fields: FormFields) => void;
  errors: FormErrors;
  setErrors: (errors: FormErrors) => void;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

interface LoginProviderProps {
  children: ReactNode;
}

export const LoginProvider: FC<LoginProviderProps> = ({ children }) => {
  const [formFields, setFormFields] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    emailOrUsername: '',
    password: '',
  });

  const contextValue = useMemo(() => ({
    formFields,
    setFormFields,
    errors,
    setErrors,
  }), [formFields, errors]);

  return (
    <LoginContext.Provider value={contextValue}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLoginContext = () => {
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error('useLoginContext must be used within a LoginProvider');
  }
  return context;
};
