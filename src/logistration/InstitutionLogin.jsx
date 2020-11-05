import React from 'react';
import { Button } from '@edx/paragon';

const InstitutionLogin = ({ onSubmitHandler, secondaryProviders }) => {
  console.log(secondaryProviders);
  return (
    <>
      <div className="d-flex justify-content-center institution-login-container">
        <div className="d-flex flex-column" style={{ width: '400px' }}>
          <h6 className=" text-center mt-5 mb-4" style={{ paddingleft: 10 }}>
            Sign in with Institution/Campus Credentials
          </h6>
          <p className="mb-4">Choose your institution from the list below:</p>
          <div className="section-heading-line mb-4">
            <h4>or</h4>
          </div>
          <Button
            className="btn-outline-primary submit"
            onClick={onSubmitHandler}
          >
            Back
          </Button>
        </div>
      </div>
    </>
  );
};

export default InstitutionLogin;
