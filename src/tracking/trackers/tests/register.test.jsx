import { createEventTracker, createPageEventTracker } from '../../../data/segment/utils';
import {
  eventNames,
  trackRegistrationPageViewed,
  trackRegistrationSuccess,
} from '../register';

// Mock createEventTracker function
jest.mock('../../../data/segment/utils', () => ({
  createEventTracker: jest.fn().mockImplementation(() => jest.fn()),
  createPageEventTracker: jest.fn().mockImplementation(() => jest.fn()),
}));

describe('Tracking Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fire registrationSuccessEvent', () => {
    trackRegistrationSuccess();

    expect(createEventTracker).toHaveBeenCalledWith(
      eventNames.registrationSuccess,
      {},
    );
  });

  it('should fire trackRegistrationPageEvent', () => {
    trackRegistrationPageViewed();

    expect(createPageEventTracker).toHaveBeenCalledWith(
      eventNames.loginAndRegistration,
      'register',
    );
  });
});
