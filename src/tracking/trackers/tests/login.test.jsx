import { createEventTracker, createPageEventTracker } from '../../../data/segment/utils';
import {
  categories,
  eventNames,
  trackForgotPasswordLinkClick,
  trackLoginPageViewed,
} from '../login';

// Mock createEventTracker function
jest.mock('../../../data/segment/utils', () => ({
  createEventTracker: jest.fn().mockImplementation(() => jest.fn()),
  createPageEventTracker: jest.fn().mockImplementation(() => jest.fn()),
}));

describe('Tracking Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('trackForgotPasswordLinkClick function', () => {
    trackForgotPasswordLinkClick();

    expect(createEventTracker).toHaveBeenCalledWith(
      eventNames.forgotPasswordLinkClicked,
      { category: categories.userEngagement },
    );
  });

  it('trackLoginPageEvent function', () => {
    trackLoginPageViewed();

    expect(createPageEventTracker).toHaveBeenCalledWith(
      eventNames.loginAndRegistration,
      'login',
    );
  });
});
