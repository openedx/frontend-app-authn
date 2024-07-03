import { createPageEventTracker } from '../../../data/segment/utils';
import {
  eventNames,
  trackResetPasswordPageViewed,
} from '../reset-password';

// Mock createEventTracker function
jest.mock('../../../data/segment/utils', () => ({
  createEventTracker: jest.fn().mockImplementation(() => jest.fn()),
  createPageEventTracker: jest.fn().mockImplementation(() => jest.fn()),
}));

describe('Tracking Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fire trackResettPasswordPageEvent', () => {
    trackResetPasswordPageViewed();

    expect(createPageEventTracker).toHaveBeenCalledWith(
      eventNames.loginAndRegistration,
      'reset-password',
    );
  });
});
