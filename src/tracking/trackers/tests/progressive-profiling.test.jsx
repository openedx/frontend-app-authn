import { createEventTracker, createPageEventTracker } from '../../../data/segment/utils';
import {
  eventNames,
  trackProgressiveProfilingPageViewed,
  trackProgressiveProfilingSkipLinkClick,
} from '../progressive-profiling';

// Mock createEventTracker function
jest.mock('../../../data/segment/utils', () => ({
  createEventTracker: jest.fn().mockImplementation(() => jest.fn()),
  createPageEventTracker: jest.fn().mockImplementation(() => jest.fn()),
  createLinkTracker: jest.fn().mockImplementation(() => jest.fn()),
}));

describe('Tracking Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fire trackProgressiveProfilingSkipLinkClickEvent', () => {
    trackProgressiveProfilingSkipLinkClick();

    expect(createEventTracker).toHaveBeenCalledWith(
      eventNames.progressiveProfilingSkipLinkClick,
      {},
    );
  });

  it('should fire trackProgressiveProfilingPageEvent', () => {
    trackProgressiveProfilingPageViewed();

    expect(createPageEventTracker).toHaveBeenCalledWith(
      eventNames.loginAndRegistration,
      'welcome',
    );
  });
});
