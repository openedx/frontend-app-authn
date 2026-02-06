import { createContext, FC, ReactNode, useContext, useMemo, useState, useCallback } from 'react';

interface LoginContextType {
  error: string | null;
  setError: (error: string | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
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
  const [errorCode, setErrorCode] = useState({
    type: '',
    count: 0,
    context: {},
  });
  const [errors, setErrors] = useState({
    emailOrUsername: '',
    password: '',
  });

  const contextValue = useMemo(() => ({
    formFields,
    setFormFields,
    errorCode,
    setErrorCode,
    errors,
    setErrors,
  }), [formFields, errorCode, errors]);


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