import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

export const RenderInstitutionLogin = (props) => {
  const { onSubmitHandler, secondaryProviders } = props;
  console.log(secondaryProviders);
  if (secondaryProviders !== undefined && secondaryProviders.length > 0) {
    return (
      <Button
        className="btn-outline-primary submit"
        onClick={onSubmitHandler}
      >
        Use my university info
      </Button>
    );
  }
  return <></>;
};

const InstitutionLogin = ({ onSubmitHandler, secondaryProviders }) => {
  return (
    <>
      <div className="d-flex justify-content-center institution-login-container">
        <div className="d-flex flex-column" style={{ width: '450px' }}>
          <p className="mt-5 ml-3 mb-4" style={{ color: '#23419f', fontSize: '20px' }}>
            Sign in with Institution/Campus Credentials
          </p>
          <div style={{ fontSize: '16px' }}>
            <p className="mb-2" style={{ fontSize: '16px' }}>Choose your institution from the list below:</p>
            <div className="mb-2 ml-2">
              <ul>
                {secondaryProviders.map((provider, i) => {
                  return (<li key={i}><a href={provider.loginUrl}>{provider.name}</a></li>);
                })}
              </ul>
            </div>
          </div>
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

InstitutionLogin.defaultProps = {
  secondaryProviders: [],
};
InstitutionLogin.propTypes = {
  onSubmitHandler: PropTypes.func.isRequired,
  secondaryProviders: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequried,
    loginUrl: PropTypes.string.isRequired,
  })),
};
export default InstitutionLogin;
