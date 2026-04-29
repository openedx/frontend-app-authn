import { FormattedMessage, getSiteConfig, useIntl } from '@openedx/frontend-base';
import { Helmet } from 'react-helmet';

import messages from './messages';

const NotFoundPage = () => {
  const { formatMessage } = useIntl();
  return (
    <div className="container-fluid d-flex py-5 justify-content-center align-items-start text-center">
      <Helmet>
        <title>
          {formatMessage(messages['error.notfound.page.title'], {
            siteName: getSiteConfig().siteName,
          })}
        </title>
      </Helmet>
      <p className="my-0 py-5 text-muted mw-32em">
        <FormattedMessage
          id="error.notfound.message"
          defaultMessage="The page you're looking for is unavailable or there's an error in the URL. Please check the URL and try again."
          description="error message when a page does not exist"
        />
      </p>
    </div>
  );
};

export default NotFoundPage;
