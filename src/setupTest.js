/* eslint-disable import/no-extraneous-dependencies */

import { getConfig } from '@edx/frontend-platform';
import { configure as configureLogging } from '@edx/frontend-platform/logging';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });
class MockLoggingService {
    logInfo = jest.fn();

    logError = jest.fn();
}

export default function initializeMockLogging() {
  const loggingService = configureLogging(MockLoggingService, {
    config: getConfig(),
  });

  return { loggingService };
}

window.scrollTo = (x, y) => {
  document.documentElement.scrollTop = y;
};
