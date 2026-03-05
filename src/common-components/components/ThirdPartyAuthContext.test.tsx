import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import { ThirdPartyAuthProvider, useThirdPartyAuthContext } from './ThirdPartyAuthContext';

const TestComponent = () => {
  const {
    fieldDescriptions,
    optionalFields,
    thirdPartyAuthApiStatus,
    thirdPartyAuthContext,
  } = useThirdPartyAuthContext();

  return (
    <div>
      <div>{fieldDescriptions ? 'FieldDescriptions Available' : 'FieldDescriptions Not Available'}</div>
      <div>{optionalFields ? 'OptionalFields Available' : 'OptionalFields Not Available'}</div>
      <div>{thirdPartyAuthApiStatus !== null ? 'AuthApiStatus Available' : 'AuthApiStatus Not Available'}</div>
      <div>{thirdPartyAuthContext ? 'AuthContext Available' : 'AuthContext Not Available'}</div>
    </div>
  );
};

describe('ThirdPartyAuthContext', () => {
  it('should render children', () => {
    render(
      <ThirdPartyAuthProvider>
        <div>Test Child</div>
      </ThirdPartyAuthProvider>,
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should provide all context values to children', () => {
    render(
      <ThirdPartyAuthProvider>
        <TestComponent />
      </ThirdPartyAuthProvider>,
    );

    expect(screen.getByText('FieldDescriptions Available')).toBeInTheDocument();
    expect(screen.getByText('OptionalFields Available')).toBeInTheDocument();
    expect(screen.getByText('AuthApiStatus Not Available')).toBeInTheDocument(); // Initially null
    expect(screen.getByText('AuthContext Available')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <ThirdPartyAuthProvider>
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </ThirdPartyAuthProvider>,
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByText('Third Child')).toBeInTheDocument();
  });
});
