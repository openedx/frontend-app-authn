import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useLocation } from 'react-router-dom';

const WelcomeMsg = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const lang = queryParams.get('lang');

  console.log(lang);

  return (
    <div className="container-fluid d-flex py-5 align-items-start">
      <h2 className="text-welcome">
        {lang === 'en' ? (
          <FormattedMessage
            id="welcome.message.en"
            defaultMessage="Welcome to the Compass Learning Platform"
            description="welcome message in English"
          />
        ) : (
          <FormattedMessage
            id="welcome.message"
            defaultMessage="Witaj na platformie edukacyjnej Compass"
            description="welcome message in Polish"
          />
        )}
      </h2>
    </div>
  );
};

export default WelcomeMsg;
